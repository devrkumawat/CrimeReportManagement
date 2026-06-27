import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate token using the strict environment secret
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password, role, badgeId, jurisdiction } = req.body;

    // Enforce unique credentials
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const phoneExists = await User.findOne({ mobileNumber });
    if (phoneExists) {
      return res.status(400).json({ message: "An account with this mobile number already exists." });
    }

    // Police specific account validation
    if (role === "police") {
      if (!badgeId) {
        return res.status(400).json({ message: "Police accounts require a Badge ID." });
      }
      const badgeExists = await User.findOne({ badgeId });
      if (badgeExists) {
        return res.status(400).json({ message: "This Badge ID is already registered." });
      }
    }

    const user = await User.create({
      fullName,
      email,
      mobileNumber,
      password,
      role: role || "citizen",
      badgeId: role === "police" ? badgeId : undefined,
      jurisdiction: role === "police" ? jurisdiction : undefined,
    });

    res.status(201).json({
      message: "Account registered successfully.",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed.", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    // FIXED: Capturing the 'role' attribute passed by the active frontend tab
    const { identifier, password, role } = req.body;

    // Dynamic database lookup using Email, Phone, or Badge ID
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { mobileNumber: identifier },
        { badgeId: identifier }
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid login details. Please try again." });
    }

    const isMatch = await user.verifyPasswordMatch(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid login details. Please try again." });
    }

    // CRITICAL SECURITY ENFORCEMENT GATE
    // Compares the tab selection profile against the role assigned inside the database document
    if (role && user.role !== role) {
      return res.status(401).json({ 
        message: `Access Denied: This account is registered under the [${user.role}] layout, not [${role}]. Please select the appropriate portal tab.` 
      });
    }

    res.status(200).json({
      message: "Login successful.",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        badgeId: user.badgeId || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login server error.", error: error.message });
  }
};