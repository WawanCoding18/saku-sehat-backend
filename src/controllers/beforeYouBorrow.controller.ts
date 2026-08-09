import { Response } from "express";
import BeforeYouBorrowModel from "../models/beforeYouBorrow.model";
import { IReqUser } from "../middlewares/auth.Middleware";
import { askAIStream } from "../services/ai.BeforeYouBorrow.services";

interface IAIResult {
  levelKelayakan?: "Layak" | "Perlu Pertimbangan" | "Tidak Disarankan";
  score?: number;
  riskLevel?: "Risiko Rendah" | "Risiko Sedang" | "Risiko Tinggi";
  hasilAsesmen?: {
    reasoning?: string;
    recommendation?: string;
    alternativeAction?: string;
  };
}

export const postBeforeYouBorrow = async (req: IReqUser, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User tidak teridentifikasi" });
  }

  //Ambil input dari body
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

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    //Panggil AI Stream
    const aiResponse = (await askAIStream(
      JSON.stringify({
        Nama_Platform,
        Tujuan_Meminjam,
        Jumlah_Pinjaman: jumlahPinjaman,
        Pemasukan_PerBulan: pemasukan,
        Pengeluaran_PerBulan: pengeluaran,
        Nominal_Pinjaman_Saat_Ini: pinjamanSaatIni,
      }),
      res
    )) as IAIResult;

    //Fallback data jika AI mengalami masalah parsing JSON
    const levelKelayakan = aiResponse?.levelKelayakan || "Perlu Pertimbangan";
    const score = aiResponse?.score || 50;
    const riskLevel = aiResponse?.riskLevel || "Risiko Sedang";
    const hasilAsesmen = aiResponse?.hasilAsesmen || {
      reasoning: "Beban pengeluaran bulanan perlu disesuaikan dengan tambahan pinjaman.",
      recommendation: "Pertimbangkan kembali kebutuhan pinjaman sebelum mengambil keputusan.",
      alternativeAction: "Kurangi nominal pinjaman atau gunakan dana simpanan terlebih dahulu."
    };

    //Simpan ke Database
    const newBeforeYouBorrow = await BeforeYouBorrowModel.create({
      user: userId,
      Nama_Platform,
      Tujuan_Meminjam,
      Jumlah_Pinjaman: jumlahPinjaman,
      Pemasukan_PerBulan: pemasukan,
      Pengeluaran_PerBulan: pengeluaran,
      Nominal_Pinjaman_Saat_Ini: pinjamanSaatIni,
      levelKelayakan,
      score,
      riskLevel,
      hasilAsesmen,
    });

    //Kirim event done beserta data baru
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        message: "Berhasil menganalisis dan menyimpan data Before You Borrow",
        data: newBeforeYouBorrow,
      })}\n\n`
    );
  } catch (error: any) {
    console.error("❌ Error pada postBeforeYouBorrow:", error.message);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Gagal memproses analisis AI",
        error: String(error.message || error),
      })}\n\n`
    );
  } finally {
    res.end();
  }
};


export const getBeforeYouBorrow = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    const latestData = await BeforeYouBorrowModel.findOne({ user: userId })
      .select(
        "Nama_Platform Tujuan_Meminjam Jumlah_Pinjaman Pemasukan_PerBulan Pengeluaran_PerBulan Nominal_Pinjaman_Saat_Ini levelKelayakan score riskLevel hasilAsesmen createdAt"
      )
      .sort({ createdAt: -1 });

    if (!latestData) {
      return res.status(200).json({
        message: "Belum ada data Before You Borrow",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil data Before You Borrow terbaru",
      data: latestData,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Gagal mengambil data", error: String(error) });
  }
};
