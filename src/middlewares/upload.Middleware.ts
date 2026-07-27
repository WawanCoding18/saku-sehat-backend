import multer from "multer";
import { Request } from "express";

//Simpan di RAM
const storage = multer.memoryStorage();

//Hanya mengizinkan format gambar yang sudah ditentukan
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
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format file tidak didukung! Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan."
      )
    );
  }
};

//membatasi batasan ukuran MB upload gambar 
export const upload = multer({
  storage,
  limits: {
    
    //maks 5 MB
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

