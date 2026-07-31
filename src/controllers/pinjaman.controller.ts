import { Request, Response } from "express";
import PinjamanModel from "../models/pinjaman.model";
import { IReqUser } from "../middlewares/auth.Middleware";


// 📝 CREATE (Tambah Data) — dibatasi maksimal 3 pinjaman per user
export const postPinjaman = async (req: IReqUser, res: Response) => {
  try {
    // 1. Ambil ID User
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    // 2. 🔒 CEK LIMIT: maksimal 3 pinjaman per user
    const jumlahPinjaman = await PinjamanModel.countDocuments({ user: userId });

    if (jumlahPinjaman >= 3) {
      return res.status(400).json({
        message:
          "Batas maksimal 3 pinjaman sudah tercapai. Hapus atau lunasi pinjaman lain terlebih dahulu.",
      });
    }

    // 3. Ambil field dari body (input murni dari user)
    const { namaPlatform, jenisPinjaman, pinjamanAwal, tenorCicilan, persenBunga, jatuhTempo } =
      req.body;

    const nominalAwal = Number(pinjamanAwal);
    const tenor = Number(tenorCicilan);
    const bunga = Number(persenBunga) || 0;

    // 4. Validasi angka dasar biar nggak divide by zero / hasil aneh
    if (!nominalAwal || nominalAwal <= 0) {
      return res.status(400).json({ message: "Pinjaman Awal harus lebih dari 0" });
    }
    if (!tenor || tenor <= 0) {
      return res.status(400).json({ message: "Tenor Cicilan harus lebih dari 0 bulan" });
    }

    // [FITUR 2: CICILAN BULANAN] -> Rumus Bunga Tetap (Flat Rate)
    // Cicilan = (Pinjaman Awal / Tenor) + (Pinjaman Awal * (Bunga% / 100))
    const pokokBulanan = nominalAwal / tenor;
    const bungaBulanan = nominalAwal * (bunga / 100);
    const cicilanBulanan = pokokBulanan + bungaBulanan;

    // [FITUR 3: SISA TAGIHAN] -> Nilai awal sama dengan Pinjaman Awal
    const sisaTagihan = nominalAwal;

    // 5. Eksekusi Query ke Database
    const newPinjaman = await PinjamanModel.create({
      user: userId,
      namaPlatform,
      jenisPinjaman,
      pinjamanAwal: nominalAwal,
      tenorCicilan: tenor,
      persenBunga: bunga,
      cicilanBulanan,       // ⬅️ hasil hitungan, bukan dari req.body
      sisaTagihan,          // ⬅️ hasil hitungan, bukan dari req.body
      jatuhTempo,
    });

    // 6. Kirim Response Sukses (201 Created)
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

// 🧮 HELPER: Hitung data pinjaman (logic-only, dipakai bareng getAllPinjaman & dashboard)
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

// 📋 GET ALL (Ambil Semua Data)
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

    // ============================================================
    // FORMAT DATA PER-ITEM (untuk kartu list pinjaman)
    // ============================================================
    const formattedData = listPinjaman.map((item) => {
      // [FITUR 5: PROGRESS PEMBAYARAN (%)]
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

    // ============================================================
    // SUMMARY (untuk 3 kartu dashboard atas)
    // ============================================================

    // [FITUR 1: BELUM DIBAYAR] -> Total dari semua sisaTagihan
    const belumDibayar = listPinjaman.reduce((acc, item) => {
      return acc + (item.sisaTagihan ?? 0);
    }, 0);

    // [FITUR 2: SUDAH DIBAYAR] -> Total uang pokok yang sudah terbayar
    const sudahDibayar = listPinjaman.reduce((acc, item) => {
      const terbayarPerItem = (item.pinjamanAwal ?? 0) - (item.sisaTagihan ?? 0);
      return acc + terbayarPerItem;
    }, 0);

    // [FITUR 3: KEWAJIBAN PERBULAN] -> Total cicilanBulanan dari pinjaman yang belum lunas
    const kewajibanPerbulan = listPinjaman.reduce((acc, item) => {
      if (item.sisaTagihan > 0) {
        return acc + (item.cicilanBulanan ?? 0);
      }
      return acc;
    }, 0);

    // ============================================================
    // KIRIM RESPONSE GABUNGAN
    // ============================================================
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

    // 1. Cari data pinjaman milik user ini
    const pinjaman = await PinjamanModel.findOne({ _id: id, user: userId });
    if (!pinjaman) {
      return res.status(404).json({ message: "Pinjaman tidak ditemukan" });
    }

    // 2. Cegah bayar cicilan kalau pinjaman sudah lunas
    if (pinjaman.statusPinjaman === "Lunas") {
      return res
        .status(400)
        .json({ message: "Pinjaman ini sudah lunas, tidak bisa dibayar lagi" });
    }

    // [FITUR 3: SISA TAGIHAN UPDATE]
    const sisaTagihanBaru = Math.max(
      0,
      pinjaman.sisaTagihan - pinjaman.cicilanBulanan
    );

    // [FITUR 4: JATUH TEMPO UPDATE] -> Maju 1 bulan
    const tglSekarang = new Date(pinjaman.jatuhTempo);
    const jatuhTempoBaru = new Date(
      tglSekarang.setMonth(tglSekarang.getMonth() + 1)
    );

    pinjaman.sisaTagihan = sisaTagihanBaru;
    pinjaman.jatuhTempo = jatuhTempoBaru;

    // 3. Kalau sisa tagihan sudah 0, tandai lunas
    if (sisaTagihanBaru === 0) {
      pinjaman.statusPinjaman = "Lunas";
    }

    await pinjaman.save();

    // 4. Kirim Response Sukses (200 OK)
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

// ✏️ EDIT DATA PINJAMAN (bukan aksi bayar, hanya ubah info dasar)
export const editPinjaman = async (req: IReqUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    // 1. Cari data pinjaman milik user ini
    const pinjaman = await PinjamanModel.findOne({ _id: id, user: userId });
    if (!pinjaman) {
      return res.status(404).json({ message: "Pinjaman tidak ditemukan" });
    }

    // 2. 🔒 Whitelist field yang BOLEH diubah lewat endpoint ini
    // sengaja TIDAK termasuk sisaTagihan & statusPinjaman,
    // karena dua field itu hanya boleh berubah lewat proses bayar cicilan (putPinjaman)
    const {
      namaPlatform,
      jenisPinjaman,
      pinjamanAwal,
      tenorCicilan,
      persenBunga,
      jatuhTempo,
    } = req.body;

    // 3. Kalau ada perubahan pinjamanAwal/tenor/bunga, hitung ulang cicilanBulanan
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

    // 4. Update field yang diizinkan
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

// 🗑️ DELETE (Hapus Data berdasarkan ID)
export const deletePinjaman = async (req: IReqUser, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // 1. Cari & Hapus Data (Model.findOneAndDelete)
    const deletedData = await PinjamanModel.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedData) {
      return res
        .status(404)
        .json({ message: "Data pinjaman tidak ditemukan atau bukan milik Anda" });
    }

    // 2. Kirim Response Sukses (200 OK)
    return res.status(200).json({
      message: "Berhasil menghapus data pinjaman",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal menghapus data pinjaman", error: String(error) });
  }
};