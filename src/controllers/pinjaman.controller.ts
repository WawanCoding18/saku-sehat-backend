import { Request, Response } from "express";
import PinjamanModel from "../models/pinjaman.model";
import { IReqUser } from "../middlewares/auth.Middleware";


//(Tambah Data) — dibatasi maksimal 3 pinjaman per user
export const postPinjaman = async (req: IReqUser, res: Response) => {
  try {
    
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    const jumlahPinjaman = await PinjamanModel.countDocuments({ user: userId });

    if (jumlahPinjaman >= 3) {
      return res.status(400).json({
        message:
          "Batas maksimal 3 pinjaman sudah tercapai. Hapus atau lunasi pinjaman lain terlebih dahulu.",
      });
    }

    const { namaPlatform, jenisPinjaman, pinjamanAwal, tenorCicilan, persenBunga, jatuhTempo } =
      req.body;

    const nominalAwal = Number(pinjamanAwal);
    const tenor = Number(tenorCicilan);
    const bunga = Number(persenBunga) || 0;

    if (!nominalAwal || nominalAwal <= 0) {
      return res.status(400).json({ message: "Pinjaman Awal harus lebih dari 0" });
    }
    if (!tenor || tenor <= 0) {
      return res.status(400).json({ message: "Tenor Cicilan harus lebih dari 0 bulan" });
    }

    // Cicilan = (Pinjaman Awal / Tenor) + (Pinjaman Awal * (Bunga% / 100))
    const pokokBulanan = nominalAwal / tenor;
    const bungaBulanan = nominalAwal * (bunga / 100);
    const cicilanBulanan = pokokBulanan + bungaBulanan;

    //Nilai awal sama dengan Pinjaman Awal
    const sisaTagihan = nominalAwal;

    //Query ke Database
    const newPinjaman = await PinjamanModel.create({
      user: userId,
      namaPlatform,
      jenisPinjaman,
      pinjamanAwal: nominalAwal,
      tenorCicilan: tenor,
      persenBunga: bunga,
      cicilanBulanan,      
      sisaTagihan,          
      jatuhTempo,
    });

    return res.status(201).json({
      message: "Berhasil menambahkan data pinjaman",
      data: newPinjaman,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Gagal membuat data pinjaman", error: String(error) });
  }
};

//Hitung data pinjaman
export const hitungDataPinjaman = async (userId: string) => {
  const listPinjaman = await PinjamanModel.find({ user: userId }).sort({
    createdAt: -1,
  });

  const formattedData = listPinjaman.map((item) => {
    const progress =
      item.pinjamanAwal > 0
        ? ((item.pinjamanAwal - item.sisaTagihan) / item.pinjamanAwal) * 100
        : 0;

    return {
      _id: item._id,
      namaPlatform: item.namaPlatform,
      jenisPinjaman: item.jenisPinjaman,
      pinjamanAwal: item.pinjamanAwal,
      cicilanBulanan: item.cicilanBulanan,
      sisaTagihan: item.sisaTagihan,
      jatuhTempo: item.jatuhTempo,
      persenBunga: item.persenBunga,
      statusPinjaman: item.statusPinjaman,
      progress: Number(progress.toFixed(1)),
    };
  });

  const belumDibayar = listPinjaman.reduce((acc, item) => {
    return acc + (item.sisaTagihan ?? 0);
  }, 0);

  const sudahDibayar = listPinjaman.reduce((acc, item) => {
    const terbayarPerItem = (item.pinjamanAwal ?? 0) - (item.sisaTagihan ?? 0);
    return acc + terbayarPerItem;
  }, 0);

  const kewajibanPerbulan = listPinjaman.reduce((acc, item) => {
    if (item.sisaTagihan > 0) {
      return acc + (item.cicilanBulanan ?? 0);
    }
    return acc;
  }, 0);

  return {
    summary: {
      belumDibayar,
      sudahDibayar,
      kewajibanPerbulan,
    },
    totalPinjaman: formattedData.length,
    sisaSlot: 3 - formattedData.length,
    data: formattedData,
  };
};

//Ambil Semua Data
export const getAllPinjaman = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    const listPinjaman = await PinjamanModel.find({ user: userId }).sort({
      createdAt: -1,
    });

    const formattedData = listPinjaman.map((item) => {
      const progress =
        item.pinjamanAwal > 0
          ? ((item.pinjamanAwal - item.sisaTagihan) / item.pinjamanAwal) * 100
          : 0;

      return {
        _id: item._id,
        namaPlatform: item.namaPlatform,
        jenisPinjaman: item.jenisPinjaman,
        pinjamanAwal: item.pinjamanAwal,
        cicilanBulanan: item.cicilanBulanan,
        sisaTagihan: item.sisaTagihan,
        jatuhTempo: item.jatuhTempo,
        persenBunga: item.persenBunga,
        statusPinjaman: item.statusPinjaman,
        progress: Number(progress.toFixed(1)),
      };
    });


    //Total dari semua sisaTagihan
    const belumDibayar = listPinjaman.reduce((acc, item) => {
      return acc + (item.sisaTagihan ?? 0);
    }, 0);

    //Total uang pokok yang sudah terbayar
    const sudahDibayar = listPinjaman.reduce((acc, item) => {
      const terbayarPerItem = (item.pinjamanAwal ?? 0) - (item.sisaTagihan ?? 0);
      return acc + terbayarPerItem;
    }, 0);

    //Total cicilanBulanan dari pinjaman yang belum lunas
    const kewajibanPerbulan = listPinjaman.reduce((acc, item) => {
      if (item.sisaTagihan > 0) {
        return acc + (item.cicilanBulanan ?? 0);
      }
      return acc;
    }, 0);

    return res.status(200).json({
      message: "Berhasil mengambil data pinjaman",
      summary: {
        belumDibayar,
        sudahDibayar,
        kewajibanPerbulan,
      },
      totalPinjaman: formattedData.length,
      sisaSlot: 3 - formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal mengambil data pinjaman", error: String(error) });
  }
};

export const putPinjaman = async (req: IReqUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    //Cari data pinjaman milik user ini
    const pinjaman = await PinjamanModel.findOne({ _id: id, user: userId });
    if (!pinjaman) {
      return res.status(404).json({ message: "Pinjaman tidak ditemukan" });
    }

    //Cegah bayar cicilan kalau pinjaman sudah lunas
    if (pinjaman.statusPinjaman === "Lunas") {
      return res
        .status(400)
        .json({ message: "Pinjaman ini sudah lunas, tidak bisa dibayar lagi" });
    }

    const sisaTagihanBaru = Math.max(
      0,
      pinjaman.sisaTagihan - pinjaman.cicilanBulanan
    );

    const tglSekarang = new Date(pinjaman.jatuhTempo);
    const jatuhTempoBaru = new Date(
      tglSekarang.setMonth(tglSekarang.getMonth() + 1)
    );

    pinjaman.sisaTagihan = sisaTagihanBaru;
    pinjaman.jatuhTempo = jatuhTempoBaru;

    //Kalau sisa tagihan sudah 0, tandai lunas
    if (sisaTagihanBaru === 0) {
      pinjaman.statusPinjaman = "Lunas";
    }

    await pinjaman.save();

    //Kirim Response Sukses (200 OK)
    return res.status(200).json({
      message: "Pembayaran cicilan berhasil",
      data: pinjaman,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal memproses pembayaran", error: String(error) });
  }
};

//Edit data bukan aksi bayar, hanya ubah info dasar
export const editPinjaman = async (req: IReqUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    //Cari data pinjaman milik user ini
    const pinjaman = await PinjamanModel.findOne({ _id: id, user: userId });
    if (!pinjaman) {
      return res.status(404).json({ message: "Pinjaman tidak ditemukan" });
    }

    const {
      namaPlatform,
      jenisPinjaman,
      pinjamanAwal,
      tenorCicilan,
      persenBunga,
      jatuhTempo,
    } = req.body;

    //Kalau ada perubahan pinjamanAwal/tenor/bunga, hitung ulang cicilanBulanan
    const nominalAwal =
      pinjamanAwal !== undefined ? Number(pinjamanAwal) : pinjaman.pinjamanAwal;
    const tenor =
      tenorCicilan !== undefined ? Number(tenorCicilan) : pinjaman.tenorCicilan;
    const bunga =
      persenBunga !== undefined ? Number(persenBunga) : pinjaman.persenBunga;

    if (nominalAwal <= 0) {
      return res.status(400).json({ message: "Pinjaman Awal harus lebih dari 0" });
    }
    if (tenor <= 0) {
      return res.status(400).json({ message: "Tenor Cicilan harus lebih dari 0 bulan" });
    }

    const pokokBulanan = nominalAwal / tenor;
    const bungaBulanan = nominalAwal * (bunga / 100);
    const cicilanBulananBaru = pokokBulanan + bungaBulanan;

    //Update field yang diizinkan
    if (namaPlatform !== undefined) pinjaman.namaPlatform = namaPlatform;
    if (jenisPinjaman !== undefined) pinjaman.jenisPinjaman = jenisPinjaman;
    if (jatuhTempo !== undefined) pinjaman.jatuhTempo = jatuhTempo;

    pinjaman.pinjamanAwal = nominalAwal;
    pinjaman.tenorCicilan = tenor;
    pinjaman.persenBunga = bunga;
    pinjaman.cicilanBulanan = cicilanBulananBaru;

    await pinjaman.save();

    return res.status(200).json({
      message: "Berhasil memperbarui data pinjaman",
      data: pinjaman,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Gagal update data pinjaman", error: String(error) });
  }
};


export const deletePinjaman = async (req: IReqUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    //Cari & Hapus Data (Model.findOneAndDelete)
    const deletedData = await PinjamanModel.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedData) {
      return res
        .status(404)
        .json({ message: "Data pinjaman tidak ditemukan atau bukan milik Anda" });
    }

    //Kirim Response Sukses (200 OK)
    return res.status(200).json({
      message: "Berhasil menghapus data pinjaman",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal menghapus data pinjaman", error: String(error) });
  }
};