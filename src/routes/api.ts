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


const router = express.Router();

//api to connect to auth/register, login, and me
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware ,authController.me);
router.post("/auth/verify-otp", authController.verifyOTP); //endpoint
router.post("/auth/resend-otp", authController.resendOTP); //endpoint
// router.post("/catatan keuangan/transaksi-manual", authController.transaksi-manual)
router.post("/", createTransaksi);
router.get("/", getAllTransaksi);
router.get("/:id", getTransaksiById);
router.put("/:id", updateTransaksi);
router.delete("/:id", deleteTransaksi);
//scan OCR
router.post('/scan', upload.single('image'), handleOcrUpload)

export default router;
