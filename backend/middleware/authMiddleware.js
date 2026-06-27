import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract token string from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token signature against your environment secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user profile from database, excluding the password field
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token validation failed." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token found." });
  }
};