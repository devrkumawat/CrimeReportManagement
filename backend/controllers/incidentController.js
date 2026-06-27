import Incident from "../models/Incident.js";
import User from "../models/User.js"; 

// 1. File a new official citizen complaint with Flexible Smart Auto-Dispatch Routing + Cloudinary Storage
export const createIncident = async (req, res) => {
  try {
    const { title, description, category, location, date } = req.body; 

    // Generate custom tracking ID string (e.g., JE-2026-839201)
    const uniqueSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `JE-2026-${uniqueSuffix}`;

    // Extract secure Cloudinary asset image links from the request files array
    let evidenceUrls = [];
    if (req.files && req.files.length > 0) {
      evidenceUrls = req.files.map((file) => file.path); // .path holds the secure cloud HTTPS URL
    }

    // Initialize fallback automated assignment parameters
    let assignedOfficerId = null;
    let incidentStatus = "Pending";
    let dispatchNotice = "No regional officer available. Case queued for administrative review.";

    // FLEXIBLE MATCHING: Extract the primary area name (e.g., "Adajan" from "Adajan, Surat, India")
    const primaryLocality = location.split(",")[0].trim();

    // SMART ROUTING: Locate officers whose jurisdiction string contains our primary area name
    const availableOfficers = await User.find({ 
      role: "police", 
      jurisdiction: { $regex: primaryLocality, $options: "i" } // Case-insensitive substring lookup
    });

    // LOAD BALANCING: If regional officers match, route to the one with the fewest active cases
    if (availableOfficers.length > 0) {
      const officerWorkloads = await Promise.all(
        availableOfficers.map(async (officer) => {
          const activeCaseCount = await Incident.countDocuments({
            assignedOfficer: officer._id,
            status: { $in: ["Pending", "Under Investigation"] } // Only calculates unresolved backlogs
          });
          return { officer, activeCaseCount };
        })
      );

      // Sort ascending so the officer with the lowest active workload sits at index 0
      officerWorkloads.sort((a, b) => a.activeCaseCount - b.activeCaseCount);
      const targetOfficer = officerWorkloads[0].officer;

      assignedOfficerId = targetOfficer._id;
      incidentStatus = "Under Investigation"; // Auto-escalate status flag since case is pushed to an active desk
      dispatchNotice = `System auto-dispatched case to Officer ${targetOfficer.fullName} (Badge: ${targetOfficer.badgeId}) assigned to ${location}.`;
    }

    // DATABASE ENTRY: Save complete complaint configuration with evidence links & assignment routing
    const incident = await Incident.create({
      userId: req.user._id, // Provided securely by auth middleware
      title,
      description,
      category,
      location,
      date, // Map date to schema
      trackingId,
      status: incidentStatus,
      evidence: evidenceUrls, // Locks cloud asset web links securely into this document block
      assignedOfficer: assignedOfficerId,
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      dispatchNotice,
      trackingId: incident.trackingId,
      incident,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit complaint.", error: error.message });
  }
};

// 2. Fetch a single, specific incident record with isolated access control routing
export const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findById(id)
      .populate("userId", "fullName email mobileNumber")
      .populate("assignedOfficer", "fullName badgeId jurisdiction");

    if (!incident) {
      return res.status(404).json({ message: "Incident file record not found." });
    }

    // ROLE SAFETY CHECK: Prevent citizens from reading other citizens' private case files
    if (req.user.role === "user" && incident.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. Private record folder restriction." });
    }

    // ROLE SAFETY CHECK: Prevent police officers from looking outside their assigned workspace desk
    if (req.user.role === "police" && incident.assignedOfficer?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. File allocation workspace desk mismatch." });
    }

    res.status(200).json(incident);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve the target incident record.", error: error.message });
  }
};

// 3. Fetch all complaints filed by the logged-in citizen
export const getUserIncidents = async (req, res) => {
  try {
    // Packs the officer's name/badge with the payload
    const incidents = await Incident.find({ userId: req.user._id })
      .populate("assignedOfficer", "fullName badgeId") 
      .sort({ createdAt: -1 });
      
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve your complaints.", error: error.message });
  }
};

// 4. Fetch records with dynamic, role-based database isolation filters
export const getAllIncidents = async (req, res) => {
  try {
    if (req.user.role !== "police" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Official clearance required." });
    }

    // Build dynamic database filter block
    let filterQuery = {};
    
    // If the logged-in user is an officer, isolate and serve ONLY their assigned cases
    if (req.user.role === "police") {
      filterQuery.assignedOfficer = req.user._id;
    }

    // Apply the structural filter criteria dynamically to the Mongoose find query
    const incidents = await Incident.find(filterQuery)
      .populate("userId", "fullName email mobileNumber")
      .populate("assignedOfficer", "fullName badgeId jurisdiction")
      .sort({ createdAt: -1 });
      
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve incident logs.", error: error.message });
  }
};

// 5. Update status flags on an incident (Police/Admin status override tool)
export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "police" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Official clearance required." });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedIncident) {
      return res.status(404).json({ message: "Incident records not found." });
    }

    res.status(200).json({ message: "Case status updated successfully.", updatedIncident });
  } catch (error) {
    res.status(500).json({ message: "Failed to update case status.", error: error.message });
  }
};


// 6. Fetch incidents assigned to the logged-in officer specifically
export const getOfficerIncidents = async (req, res) => {
  try {
    if (req.user.role !== "police" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Official clearance required." });
    }

    const incidents = await Incident.find({ assignedOfficer: req.user._id })
      .populate("userId", "fullName email mobileNumber")
      .populate("assignedOfficer", "fullName badgeId jurisdiction")
      .sort({ createdAt: -1 });

    res.status(200).json({ incidents }); // Sends wrapper object expected by OfficerDashboard.jsx
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve assigned incident logs.", error: error.message });
  }
};

export const resolveIncident = async (req, res) => {
  try {
    if (req.user.role !== "police" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Official clearance required." });
    }

    const { id } = req.params;
    const { finalStatement, status } = req.body; 
    const fileUrl = req.file ? req.file.path : null; 

    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      {
        status: status || "Resolved",
        finalStatement: finalStatement || "",
        ...(fileUrl && { finalReportFile: fileUrl }) 
      },
      { new: true, runValidators: true }
    );

    if (!updatedIncident) {
      return res.status(404).json({ message: "Incident file record not found." });
    }

    res.status(200).json({ 
      message: `Case status successfully updated to ${updatedIncident.status}.`, 
      updatedIncident 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to execute case update.", error: error.message });
  }
};