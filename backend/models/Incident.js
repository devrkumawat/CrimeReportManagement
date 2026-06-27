import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Complaint title is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Detailed description is required."],
    },
    category: {
      type: String,
      required: [true, "Crime category is required."],
      enum: ["Theft", "Cybercrime", "Assault", "Harassment", "Fraud", "Other"],
    },
    date: {
      type: Date,
      required: [true, "Incident occurrence date and time is required."],
    },
    location: {
      type: String,
      required: [true, "Incident location is required."],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Under Investigation", "Resolved", "Rejected"],
      default: "Pending",
    },
    trackingId: {
      type: String,
      required: true,
      unique: true,
    },
    evidence: {
      type: [String],
      default: [],
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // NEW: Fields for Case Resolution Artifacts
    finalStatement: {
      type: String,
      default: "",
    },
    finalReportFile: {
      type: String, // Stores secure Cloudinary document URL path
      default: null,
    },
  },
  { timestamps: true }
);

const Incident = mongoose.model("Incident", incidentSchema);
export default Incident;