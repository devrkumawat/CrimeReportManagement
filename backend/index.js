import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dns from "dns"; // 🌟 1. Import Node's native DNS module

// 🌟 2. FORCE NODE TO USE GOOGLE DNS (Bypasses your local router/ISP block instantly!)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import authRoutes from "./routes/authRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 

// Validate environment configuration before booting
if (!process.env.MONGODB_URI) {
  console.error("\n❌ [CRITICAL CONFIG ERROR]: MONGODB_URI is missing in your .env file!");
  process.exit(1);
}

if (!process.env.PORT) {
  console.error("\n❌ [CRITICAL CONFIG ERROR]: PORT variable is missing in your .env file!");
  process.exit(1);
}

const app = express();

// CORS origin rules configuration
// Ensure we only add defined values
const allowedOrigins = [
  "http://localhost:5173", 
  "http://127.0.0.1:5173",
  process.env.FRONTEND_PRODUCTION_URL
].filter(Boolean); // 🚀 This removes any 'undefined' or empty strings

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Network security block: Access denied by CORS policy."));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" })); 

// API Endpoints Switchboard
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/incidents", incidentRoutes);
app.use("/api/v1/admin", adminRoutes); 

// MongoDB connection & Operational Seeding Matrix
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("[DATABASE NODE]: Pipeline online.");

    try {
      const User = mongoose.model("User"); 
      const adminExists = await User.findOne({ role: "admin" });
      
      if (!adminExists) {
        await User.create({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          fullName: "System Administrator",
          role: "admin",
          mobileNumber: "0000000000" 
        });
        console.log("[DATABASE SEED]: System identified pristine cluster. Default Master Administrator created.");
      }
    } catch (seedErr) {
      console.warn("[DATABASE SEED WARNING]: Seeding step bypassed safely:", seedErr.message);
    }
  })
  .catch((err) => console.error("[DATABASE ERROR]: Setup failed:", err));

// Server listener lifecycle
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`[SERVER ACTIVE]: Monitoring port ${PORT}`);
});
