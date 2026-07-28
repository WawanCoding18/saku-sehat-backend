import { Response } from "express";
import TransaksiModel from "../models/transaksi.model";
import { IReqUser } from "../middlewares/auth.Middleware";
import ProfileModel from "../models/profile.model";

// 📝 CREATE TRANSAKSI
export const createTransaksi = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log("User dari Token:", req.user);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    const { Catatan_Transaksi, tipe, kategori, Sumber_Dana, nominal, tanggal } =
      req.body;

    const transaksi = await TransaksiModel.create({
      user: userId,
      Catatan_Transaksi,
      tipe,
      kategori,
      Sumber_Dana,
      nominal: Number(nominal),
      tanggal: tanggal ? new Date(tanggal) : new Date(),
    });

    return res
      .status(201)
      .json({ message: "Transaksi berhasil dibuat", data: transaksi });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Gagal membuat transaksi", error: String(error) });
  }
};

// 📋 GET ALL TRANSAKSI (Hanya milik user yang sedang login)
export const getAllTransaksi = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type } = req.query;

    // 1. Ambil SEMUA transaksi user untuk menghitung Saldo & Ringkasan Utama
    const allTransaksi = await TransaksiModel.find({ user: userId });
    const totalPemasukan = allTransaksi
      .filter((t) => t.tipe === "pemasukan")
      .reduce((acc, curr) => acc + (curr.nominal ?? 0), 0);

    const totalPengeluaran = allTransaksi
      .filter((t) => t.tipe === "pengeluaran")
      .reduce((acc, curr) => acc + (curr.nominal ?? 0), 0);

    const saldoAwal = await ProfileModel.findOne({ user: userId }).select(
      "saldoSekarang",
    );
    const saldo = (saldoAwal?.saldoSekarang ?? 0) + totalPemasukan - totalPengeluaran;

    // 2. Filter untuk list History di bawah (jika tombol filter Pemasukan/Pengeluaran diklik)
    const filter: any = { user: userId };
    if (type) {
      filter.tipe = type;
    }

    const transaksiList = await TransaksiModel.find(filter).sort({
      tanggal: -1,
    });

    // 3. Kirim ringkasan + list history sekaligus
    return res.status(200).json({
      summary: {
        saldo,
        totalPemasukan,
        totalPengeluaran,
      },
      data: transaksiList,
      
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal mengambil data", error: String(error) });
  }
};

// 🔍 GET TRANSAKSI BY ID
export const getTransaksiById = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;

    // 🔒 Cari berdasarkan ID transaksi DAN ID user
    const transaksi = await TransaksiModel.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    return res.status(200).json({ data: transaksi });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal mengambil data", error: String(error) });
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
      { new: true, runValidators: true },
    );

    if (!transaksi) {
      return res
        .status(404)
        .json({
          message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses",
        });
    }

    return res
      .status(200)
      .json({ message: "Transaksi berhasil diupdate", data: transaksi });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Gagal update transaksi", error: String(error) });
  }
};

// 🗑️ DELETE TRANSAKSI
export const deleteTransaksi = async (req: IReqUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // 1. Cari transaksi yang mau dihapus terlebih dahulu
    const transaksi = await TransaksiModel.findOne({ _id: id, user: userId });
    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // 2. Ambil Profile
    const profile = await ProfileModel.findOne({ user: userId });

    if (profile) {
      // 3. Balikkan nilai saldo
      if (transaksi.tipe === "pemasukan") {
        profile.saldoSekarang -= transaksi.nominal; // Pemasukan batal, saldo berkurang
      } else if (transaksi.tipe === "pengeluaran") {
        profile.saldoSekarang += transaksi.nominal; // Pengeluaran batal, saldo kembali
      }

    }

    // 4. Hapus transaksi dari DB
    await TransaksiModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Transaksi berhasil dihapus",
      saldoBaru: profile?.saldoSekarang,
    });
  } catch (error) {
    return res.status(500).json({ message: "Gagal menghapus transaksi", error: String(error) });
  }
};
