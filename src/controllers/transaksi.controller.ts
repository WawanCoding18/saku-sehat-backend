import { Response } from "express";
import TransaksiModel from "../models/transaksi.model";
import { IReqUser } from "../middlewares/auth.Middleware";
import ProfileModel from "../models/profile.model";

//nambah transaksi
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

//Hitung data transaksi
export const hitungDataTransaksi = async (userId: string, type?: string) => {
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

  const filter: any = { user: userId };
  if (type) {
    filter.tipe = type;
  }

  const transaksiList = await TransaksiModel.find(filter).sort({
    tanggal: -1,
  });

  return {
    summary: {
      saldo,
      totalPemasukan,
      totalPengeluaran,
    },
    data: transaksiList,
  };
};

export const getAllTransaksi = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type } = req.query;

    // Ambil semua transaksi user untuk menghitung Saldo & Ringkasan Utama
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

    //Filter untuk list History di bawah (jika tombol filter Pemasukan/Pengeluaran diklik)
    const filter: any = { user: userId };
    if (type) {
      filter.tipe = type;
    }

    const transaksiList = await TransaksiModel.find(filter).sort({
      tanggal: -1,
    });

    //Kirim ringkasan + list history sekaligus
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

export const getTransaksiById = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;

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

export const updateTransaksi = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;

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


//delete transaksi menggunakan konsep ACID (Atomicity, Consistency, Isolation, Durability) untuk memastikan integritas data.
export const deleteTransaksi = async (req: IReqUser, res: Response) => {
  const session = await TransaksiModel.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user?.id;

    //Cari transaksi yang mau dihapus terlebih dahulu
    const transaksi = await TransaksiModel.findOne({ _id: id, user: userId }).session(session);
    if (!transaksi) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    //Ambil Profile
    const profile = await ProfileModel.findOne({ user: userId }).session(session);

    if (profile) {
      // Balikkan nilai saldo
      if (transaksi.tipe === "pemasukan") {
        profile.saldoSekarang -= transaksi.nominal; 
      } else if (transaksi.tipe === "pengeluaran") {
        profile.saldoSekarang += transaksi.nominal; 
      }
      await profile.save({ session }); 
    }

  
    await TransaksiModel.findByIdAndDelete(id).session(session);

    //Semua berhasil, commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Transaksi berhasil dihapus",
      saldoBaru: profile?.saldoSekarang,
    });
  } catch (error) {
    // Kalau ada langkah manapun yang gagal, batalkan semua perubahannya
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Gagal menghapus transaksi", error: String(error) });
  }
};