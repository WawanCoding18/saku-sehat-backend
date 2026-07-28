// ==========================================
// 1. IMPORT
// ==========================================
import { Request, Response } from "express";
import SimulasiPinjamanModel from "../models/kalkulator.model";
import { IReqUser } from "../middlewares/auth.Middleware";

// ==========================================
// 2. CONTROLLER FUNCTIONS
// ==========================================

// 📝 CREATE (Hitung & Simpan Simulasi Kalkulator Bunga)
export const postKalkulatorBunga = async (req: IReqUser, res: Response) => {
  try {
    // 1. Ambil ID User
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    // 2. Ambil input dari body
    const { jumlahPinjaman, bungaPerBulan, tenorCicilan, dendaPerHari, deadlineTarget } =
      req.body;

    const pokok = Number(jumlahPinjaman);
    const bunga = Number(bungaPerBulan);
    const tenor = Number(tenorCicilan);
    const denda = Number(dendaPerHari) || 0;

    // 3. Validasi input dasar
    if (!pokok || pokok <= 0) {
      return res.status(400).json({ message: "Jumlah Pinjaman harus lebih dari 0" });
    }
    if (bunga === undefined || bunga < 0) {
      return res.status(400).json({ message: "Bunga per Bulan tidak valid" });
    }
    if (!tenor || tenor <= 0) {
      return res.status(400).json({ message: "Tenor Cicilan harus lebih dari 0 bulan" });
    }

    // 4. 🧮 RUMUS KALKULASI (Bunga Flat Rate per Bulan)
    // Total Bunga = Pokok * (Bunga% / 100) * Tenor
    const totalBunga = pokok * (bunga / 100) * tenor;

    // Total Pembayaran = Pokok + Total Bunga
    const totalPembayaran = pokok + totalBunga;

    // Total Bayar per Bulan = Total Pembayaran / Tenor
    const totalBayarPerBulan = totalPembayaran / tenor;

    // Bunga Efektif Tahunan (compound) = ((1 + bunga/100)^12 - 1) * 100
    const bungaEfektifTahunan =
      (Math.pow(1 + bunga / 100, 12) - 1) * 100;

    // 5. Eksekusi Query ke Database (Model.create)
    const newSimulasi = await SimulasiPinjamanModel.create({
      user: userId,
      jumlahPinjaman: pokok,
      bungaPerBulan: bunga,
      tenorCicilan: tenor,
      dendaPerHari: denda,
      deadlineTarget,
      totalBunga: Number(totalBunga.toFixed(2)),
      totalPembayaran: Number(totalPembayaran.toFixed(2)),
      totalBayarPerBulan: Number(totalBayarPerBulan.toFixed(2)),
      bungaEfektifTahunan: Number(bungaEfektifTahunan.toFixed(1)),
      // levelRisiko & analisisAI sengaja tidak diisi dulu (fitur AI menyusul)
    });

    // 6. Kirim Response Sukses (201 Created)
    return res.status(201).json({
      message: "Berhasil menghitung dan menyimpan simulasi",
      data: newSimulasi,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Gagal menghitung simulasi", error: String(error) });
  }
};

// 📋 GET ALL (Ambil Semua Riwayat Simulasi — hanya 4 field hasil kalkulasi)
export const getAllKalkulatorBunga = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    const dataList = await SimulasiPinjamanModel.find({ user: userId })
      .select("totalBunga totalPembayaran totalBayarPerBulan bungaEfektifTahunan")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Berhasil mengambil data simulasi",
      data: dataList,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal mengambil data", error: String(error) });
  }
};
// 🗑️ DELETE (Hapus Riwayat Simulasi)
// export const deleteKalkulatorBunga = async (req: IReqUser, res: Response) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user?.id;

//     const deletedData = await SimulasiPinjamanModel.findOneAndDelete({
//       _id: id,
//       user: userId,
//     });

//     if (!deletedData) {
//       return res.status(404).json({ message: "Data tidak ditemukan" });
//     }

//     return res.status(200).json({
//       message: "Berhasil menghapus data simulasi",
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Gagal menghapus data", error: String(error) });
//   }
// };