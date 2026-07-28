// ==========================================
// 1. IMPORT
// ==========================================
import { Response } from "express";
import BeforeYouBorrowModel from "../models/beforeYouBorrow.model";
import { IReqUser } from "../middlewares/auth.Middleware";

// ==========================================
// 2. CONTROLLER FUNCTIONS
// ==========================================

// 📝 CREATE (Simpan Data Before You Borrow)
export const postBeforeYouBorrow = async (req: IReqUser, res: Response) => {
  try {
    // 1. Ambil ID User
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    // 2. Ambil input dari body
    const {
      Nama_Platform,
      Tujuan_Meminjam,
      Jumlah_Pinjaman,
      Pemasukan_PerBulan,
      Pengeluaran_PerBulan,
      Nominal_Pinjaman_Saat_Ini,
    } = req.body || {};

    const jumlahPinjaman = Number(Jumlah_Pinjaman);
    const pemasukan = Number(Pemasukan_PerBulan);
    const pengeluaran = Number(Pengeluaran_PerBulan);
    const pinjamanSaatIni = Number(Nominal_Pinjaman_Saat_Ini) || 0;

    // 3. Validasi input dasar
    if (!Nama_Platform) {
      return res.status(400).json({ message: "Nama Platform wajib diisi" });
    }
    if (!Tujuan_Meminjam) {
      return res.status(400).json({ message: "Tujuan Meminjam wajib dipilih" });
    }
    if (!jumlahPinjaman || jumlahPinjaman <= 0) {
      return res.status(400).json({ message: "Jumlah Pinjaman harus lebih dari 0" });
    }
    if (pemasukan === undefined || isNaN(pemasukan) || pemasukan < 0) {
      return res.status(400).json({ message: "Pemasukan per Bulan tidak valid" });
    }
    if (pengeluaran === undefined || isNaN(pengeluaran) || pengeluaran < 0) {
      return res.status(400).json({ message: "Pengeluaran per Bulan tidak valid" });
    }

    // 4. Eksekusi Query ke Database (Model.create)
    const newBeforeYouBorrow = await BeforeYouBorrowModel.create({
      user: userId,
      Nama_Platform,
      Tujuan_Meminjam,
      Jumlah_Pinjaman: jumlahPinjaman,
      Pemasukan_PerBulan: pemasukan,
      Pengeluaran_PerBulan: pengeluaran,
      Nominal_Pinjaman_Saat_Ini: pinjamanSaatIni,
      // hasilAsesmen & levelKelayakan sengaja tidak diisi dulu (fitur AI menyusul)
    });

    // 5. Kirim Response Sukses (201 Created)
    return res.status(201).json({
      message: "Berhasil menyimpan data Before You Borrow",
      data: newBeforeYouBorrow,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Gagal menyimpan data", error: String(error) });
  }
};