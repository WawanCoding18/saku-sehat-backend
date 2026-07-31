import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.Middleware";
import { createTransaksi, getAllTransaksi, getTransaksiById, updateTransaksi, deleteTransaksi} from "../controllers/transaksi.controller";
import { upload } from "../middlewares/upload.Middleware"
import { handleOcrUpload } from "../controllers/chat.controller";
import { getProfile, postProfile, updateProfile } from "../controllers/profile.controller";
import { postPinjaman, getAllPinjaman, putPinjaman, editPinjaman, deletePinjaman } from "../controllers/pinjaman.controller";
import { postKalkulatorBunga, getAllKalkulatorBunga } from "../controllers/kalkulator.controller"
import { postBudgeting, getAllBudgeting, updateBudgeting, deleteBudgeting } from "../controllers/budgeting.controller";
import { postBeforeYouBorrow } from "../controllers/beforeYouBorrow.controller";
import { postCariAman } from "../controllers/cariAman.controller";
import { postFinancialHealth } from "../controllers/financialHealth.controller"
import { getDashboard } from "../controllers/dashboard.controller";


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
router.post('/catatan-keuangan/scan', upload.single('image'), authMiddleware, handleOcrUpload);

//router pinjaman
router.post("/catatan-keuangan/pinjaman/tambah-pinjaman", authMiddleware, postPinjaman);
router.get("/catatan-keuangan/pinjaman", authMiddleware, getAllPinjaman);
router.put("/catatan-keuangan/pinjaman/:id/bayar", authMiddleware, putPinjaman);
router.put("/catatan-keuangan/pinjaman/:id", authMiddleware, editPinjaman);
router.delete("/catatan-keuangan/pinjaman/:id", authMiddleware, deletePinjaman);

//router kalkulator bunga
router.post('/kalkulator-bunga', authMiddleware, postKalkulatorBunga);
router.get("/kalkulator-bunga/output", authMiddleware, getAllKalkulatorBunga)

//router budgeting
router.post("/catatan-keuangan/budgeting/tambah-budget", authMiddleware, postBudgeting);
router.get("/catatan-keuangan/budgeting", authMiddleware, getAllBudgeting);
router.put("/catatan-keuangan/budgeting/:id", authMiddleware, updateBudgeting);
router.delete("/catatan-keuangan/budgeting/:id", authMiddleware, deleteBudgeting);

//router before you borrow
router.post("/before-you-borrow", authMiddleware, postBeforeYouBorrow)

//router cariAman
router.post("/cariAman", authMiddleware, postCariAman);

//router financialhealth
router.post("/dashboard/financial-health", authMiddleware, postFinancialHealth)
router.get("/dashboard", authMiddleware, getDashboard)

export default router;
