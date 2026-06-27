import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const seedAdminAccount = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB cluster node...");

    const adminEmail = "admin@justiceeye.gov.in";

    // Delete any old, broken double-hashed admin profiles first
    await User.deleteMany({ email: adminEmail });
    console.log("Purged old admin instances to prevent conflicts.");

    // NOTICE: We are passing the password as PLAIN TEXT here.
    // This allows your User model's pre-save hook to hash it correctly.
    await User.create({
      fullName: "System Administrator",
      email: adminEmail,
      password: "#Dev2610", // Plain text string here
      mobileNumber: "9999999999",
      role: "admin", 
    });

    console.log("\n=======================================================");
    console.log("SUCCESS: Single-hash admin account seeded successfully!");
    console.log("=======================================================\n");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding the admin account:\n", error.message);
    process.exit(1);
  }
};

seedAdminAccount();