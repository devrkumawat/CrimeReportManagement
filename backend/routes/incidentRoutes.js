import express from "express";
import { createIncident, getUserIncidents, getAllIncidents, getOfficerIncidents, updateIncidentStatus, resolveIncident, getIncidentById } from "../controllers/incidentController.js";  
import { protect } from "../middleware/authMiddleware.js";
import uploadCloud from "../config/cloudinaryConfig.js"; 
import Incident from "../models/Incident.js"; 

const router = express.Router();

// Civilian Actions
router.post("/create", protect, uploadCloud.array("evidence", 5), createIncident);
router.get("/my-reports", protect, getUserIncidents);

// Police & Admin Control Room
router.get("/all", protect, getAllIncidents);
router.get("/my-assignments", protect, getOfficerIncidents); // <-- NEW: Used by OfficerDashboard.jsx
router.patch("/status/:id", protect, updateIncidentStatus);
router.patch("/resolve/:id", protect, uploadCloud.single("finalReport"), resolveIncident);
// General Lookups
router.get("/details/:id", protect, getIncidentById);

// Public Stats Aggregate Route (Keep outside of protected groups)
router.get("/stats", async (req, res) => {
  try {
    console.log("Attempting to aggregate Incident data..."); 

    const stats = await Incident.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    console.log("Aggregation successful:", stats); 

    const result = {
      total: stats.reduce((acc, curr) => acc + curr.count, 0),
      pending: stats.find(s => s._id === "Pending")?.count || 0,
      investigating: stats.find(s => s._id === "Under Investigation")?.count || 0,
      resolved: stats.find(s => s._id === "Resolved")?.count || 0,
    };
    res.json(result);
  } catch (err) {
    console.error("Aggregation Error Details:", err); 
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;