import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. Cloudinary Config (Set these in .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Backblaze B2 (S3 Compatible) Config (Set these in .env)
const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
});

/**
 * POST /api/upload/logo
 * Uploads directly to Cloudinary
 */
router.post("/logo", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    // Cloudinary upload from memory buffer using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "brandflow_logos" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(req.file!.buffer);
    });

    return res.json({ url: (uploadResult as any).secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

/**
 * POST /api/upload/document
 * Uploads to Backblaze B2 via AWS S3 SDK
 */
router.post("/document", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const bucketName = process.env.B2_BUCKET_NAME!;
    const originalName = req.file.originalname;
    const extension = originalName.substring(originalName.lastIndexOf("."));
    const uniqueFileName = `docs/${crypto.randomUUID()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    // Construct the public URL (ensure your B2 bucket is public, or generate signed URLs on fetch)
    const url = `${process.env.B2_ENDPOINT}/${bucketName}/${uniqueFileName}`;

    return res.json({ url, name: originalName });
  } catch (error) {
    console.error("Backblaze S3 upload error:", error);
    return res.status(500).json({ error: "Failed to upload document" });
  }
});

export default router;