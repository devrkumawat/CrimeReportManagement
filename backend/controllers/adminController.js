import User from "../models/User.js";
import Incident from "../models/Incident.js"; // NEW: Injected to run retroactive case sweeps

// 1. Onboard a brand new authorized police account
export const createPoliceAccount = async (req, res) => {
  try {
    // NOTICE: badgeId is removed from req.body since it's auto-generated here
    const { fullName, email, password, mobileNumber, jurisdiction } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // LOCATION LOGIC: Enforce that a valid jurisdiction location block must be assigned
    if (!jurisdiction) {
      return res.status(400).json({ message: "Account generation failed: A specific jurisdiction zone must be allocated." });
    }

    // RANDOMIZED BADGE ID: Generates a secure, uniform random tracking badge string
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const badgeId = `POL-2026-${randomDigits}`;

    const police = await User.create({
      fullName,
      email,
      password, // Left as plain text for userSchema.pre("save") single-hash interceptor
      mobileNumber,
      role: "police",
      badgeId,  // Injected automatic random badge
      jurisdiction,
    });

    // FLEXIBLE MATCHING: Extract primary area tag (e.g., "Adajan" from "Adajan, Surat, Gujarat")
    const primaryLocality = jurisdiction.split(",")[0].trim();

    // RETROACTIVE SWEEP ENGINE: Auto-route previously unassigned pending complaints to this new officer's desk
    const sweepResult = await Incident.updateMany(
      {
        status: "Pending",
        assignedOfficer: null,
        location: { $regex: primaryLocality, $options: "i" } // Case-insensitive substring match
      },
      {
        $set: {
          assignedOfficer: police._id,
          status: "Under Investigation" // Escalate status seamlessly out of queue
        }
      }
    );

    // Dynamic UI feedback letting the admin know how many complaints were cleared from backlog
    res.status(201).json({ 
      message: `Officer ${fullName} onboarded with Badge ID: ${badgeId}. Retroactively assigned ${sweepResult.modifiedCount} pending regional cases!`, 
      police 
    });
  } catch (error) {
    // Fallback handler if the random number clashes with a rare pre-existing badge unique index
    if (error.code === 11000 && error.keyPattern?.badgeId) {
      return res.status(500).json({ message: "System index collision. Please try submitting the form again." });
    }
    res.status(500).json({ message: "Server error during account generation.", error: error.message });
  }
};

// 2. Retrieve all active police accounts from database
export const getAllPoliceAccounts = async (req, res) => {
  try {
    const officers = await User.find({ role: "police" }).sort({ createdAt: -1 });
    res.status(200).json(officers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch officer roster.", error: error.message });
  }
};

// 3. Modify existing parameters of an active police profile
export const updatePoliceAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, mobileNumber, jurisdiction } = req.body;

    const updatedOfficer = await User.findByIdAndUpdate(
      id,
      { fullName, email, mobileNumber, jurisdiction },
      { new: true, runValidators: true }
    );

    if (!updatedOfficer) {
      return res.status(404).json({ message: "Officer records not found." });
    }

    res.status(200).json({ message: "Officer profile updated successfully.", updatedOfficer });
  } catch (error) {
    res.status(500).json({ message: "Failed to update officer profile.", error: error.message });
  }
};

// 4. Completely remove a police officer from database
export const deletePoliceAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const officer = await User.findByIdAndDelete(id);

    if (!officer) {
      return res.status(404).json({ message: "Officer records not found." });
    }

    res.status(200).json({ message: "Officer account purged from tracking network logs." });
  } catch (error) {
    res.status(500).json({ message: "Failed to purge account logs.", error: error.message });
  }
};

// 5. Retrieve all registered citizen accounts from the database
export const getAllCitizens = async (req, res) => {
  try {
    const citizens = await User.find({ role: "citizen" }).select("-password").sort({ createdAt: -1 });
    res.status(200).json(citizens);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch citizen account logs.", error: error.message });
  }
};