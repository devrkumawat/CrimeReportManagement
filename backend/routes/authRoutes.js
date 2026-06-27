import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// ADD THIS ROUTE: Fetches the latest user data from the database
router.get("/me", protect, (req, res) => {
  // 'protect' middleware already populates req.user
  res.status(200).json(req.user);
});

export default router;