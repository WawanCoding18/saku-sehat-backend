import multer from "multer";
import { Request } from "express";

// 1. Simpan di RAM (Memory Storage) untuk pemrosesan cepat ke AI Service
const storage = multer.memoryStorage();

// 2. Filter Tipe File: Hanya mengizinkan format gambar yang didukung AI Vision
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Terima file
  } else {
    cb(
      new Error(
        "Format file tidak didukung! Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan."
      )
    );
  }
};

// 3. Instance Multer dengan Proteksi Ukuran & Tipe File
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB (Mencegah error payload terlalu besar di Gemini/Groq)
  },
  fileFilter,
});

