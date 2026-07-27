import { Response } from "express";
import TransaksiModel from "../models/transaksi.model";
import { IReqUser } from "../middlewares/auth.Middleware";

// 📝 CREATE TRANSAKSI
export const createTransaksi = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log("User dari Token:", req.user);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    const { Catatan_Transaksi,tipe, kategori, Sumber_Dana, nominal, tanggal } = req.body;

    const transaksi = await TransaksiModel.create({
      user: userId,
      Catatan_Transaksi, 
      tipe,
      kategori,
      Sumber_Dana,
      nominal: Number(nominal),
      tanggal: tanggal ? new Date(tanggal) : new Date(),
    });

    return res.status(201).json({ message: "Transaksi berhasil dibuat", data: transaksi });
  } catch (error) {
    return res.status(400).json({ message: "Gagal membuat transaksi", error: String(error) });
  }
};

// 📋 GET ALL TRANSAKSI (Hanya milik user yang sedang login)
export const getAllTransaksi = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;

    // 🔒 Filter wajib: user: userId
    const transaksi = await TransaksiModel.find({ user: userId }).sort({ tanggal: -1 });

    return res.status(200).json({ data: transaksi });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengambil data", error: String(error) });
  }
};

// 🔍 GET TRANSAKSI BY ID
export const getTransaksiById = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;

    // 🔒 Cari berdasarkan ID transaksi DAN ID user
    const transaksi = await TransaksiModel.findOne({ _id: req.params.id, user: userId });

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    return res.status(200).json({ data: transaksi });
  } catch (error) {
    return res.status(500).json({ message: "Gagal mengambil data", error: String(error) });
  }
};

// ✏️ UPDATE TRANSAKSI
export const updateTransaksi = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;

    // 🔒 Gunakan findOneAndUpdate agar user lain tidak bisa mengedit transaksi milik orang lain
    const transaksi = await TransaksiModel.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses" });
    }

    return res.status(200).json({ message: "Transaksi berhasil diupdate", data: transaksi });
  } catch (error) {
    return res.status(400).json({ message: "Gagal update transaksi", error: String(error) });
  }
};

// 🗑️ DELETE TRANSAKSI
export const deleteTransaksi = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;

    // 🔒 Gunakan findOneAndDelete
    const transaksi = await TransaksiModel.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses" });
    }

    return res.status(200).json({ message: "Transaksi berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ message: "Gagal hapus transaksi", error: String(error) });
  }
};