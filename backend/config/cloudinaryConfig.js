import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Establishes a secure pipeline connection with your dashboard credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Outlines structural rules for incoming criminal evidence payloads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "justiceeye_evidence", // Automatically creates this folder inside your cloud vault
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "mp4"], // Allows graphics, video data, or text attachments
    resource_type: "auto", // Automatically detects media formats (e.g. tracks video separately from standard pictures)
  },
});

const uploadCloud = multer({ storage });
export default uploadCloud;