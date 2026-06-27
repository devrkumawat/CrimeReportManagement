import express from "express";
import {
  createPoliceAccount,
  getAllPoliceAccounts,
  updatePoliceAccount,
  deletePoliceAccount,
  getAllCitizens, // Included the user directory method we added
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Inline security guard checking for explicit admin authorization role
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Administrative security clearance required." });
  }
};

// Apply security barriers globally across this switchboard layout
router.use(protect, adminOnly);

// Route endpoints mapping
router.post("/police", createPoliceAccount);
router.get("/police", getAllPoliceAccounts);
router.put("/police/:id", updatePoliceAccount);
router.delete("/police/:id", deletePoliceAccount);
router.get("/users", getAllCitizens);

export default router;