import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.Middleware";
import {
  createTransaksi,
  getAllTransaksi,
  getTransaksiById,
  updateTransaksi,
  deleteTransaksi,
} from "../controllers/transaksi.controller";
import { upload } from "../middlewares/upload.Middleware"
import { handleOcrUpload } from "../controllers/chat.controller";
import { getProfile, postProfile, updateProfile } from "../controllers/profile.controller";




const router = express.Router();

//api to connect to auth/register, login, and me
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware ,authController.me);
router.post("/auth/verify-otp", authController.verifyOTP);
router.post("/auth/resend-otp", authController.resendOTP); 
//router profile
router.post("/profile/onboarding", authMiddleware, postProfile);
router.get("/profile", authMiddleware, getProfile)
router.put("/profile", authMiddleware, updateProfile)
// router.post("/catatan keuangan/transaksi-manual", authController.transaksi-manual)
router.post("/catatan-keuangan/transaksi", authMiddleware, createTransaksi);
router.get("/catatan-keuangan", authMiddleware, getAllTransaksi);
router.get("/catatan-keunagan/:id", authMiddleware, getTransaksiById);
router.put("/catatan-keuangan/:id", authMiddleware, updateTransaksi);
router.delete("/catatan-keuangan/:id", authMiddleware, deleteTransaksi);
//scan OCR
router.post('/catatan-keuangan/scan', upload.single('image'), handleOcrUpload)

export default router;
