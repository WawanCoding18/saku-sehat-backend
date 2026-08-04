import { Response } from "express";
import BeforeYouBorrowModel from "../models/beforeYouBorrow.model";
import { IReqUser } from "../middlewares/auth.Middleware";

export const postBeforeYouBorrow = async (req: IReqUser, res: Response) => {
  try {
  
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

    // Validasi input dasar
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

    //Query ke Database
    const newBeforeYouBorrow = await BeforeYouBorrowModel.create({
      user: userId,
      Nama_Platform,
      Tujuan_Meminjam,
      Jumlah_Pinjaman: jumlahPinjaman,
      Pemasukan_PerBulan: pemasukan,
      Pengeluaran_PerBulan: pengeluaran,
      Nominal_Pinjaman_Saat_Ini: pinjamanSaatIni,
      //fitur AI menyusul
    });

    //Kirim Response Sukses
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