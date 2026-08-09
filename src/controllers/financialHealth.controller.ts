import { Response } from "express";
import { IReqUser } from "../middlewares/auth.Middleware";
import FinancialHealthModel from "../models/financialHealth.model";
import BudgetingModel from "../models/budgeting.model";
import PinjamanModel from "../models/pinjaman.model";
import TransaksiModel from "../models/transaksi.model";
import { askAIStream } from "../services/ai.FinancialHealth.services";

// Tipe data khusus hasil respons dari AI
interface IAIResult {
  disiplinAnggaran?: {
    ringkasan?: string;
    saranPerkembangan?: string[];
  };
  pengelolaanPinjaman?: {
    ringkasan?: string;
    saranPerkembangan?: string[];
  };
}

const hitungDisiplinAnggaran = async (userId: string) => {
  const listBudgeting = await BudgetingModel.find({ user: userId });

  if (listBudgeting.length === 0) {
    return {
      skor: 0,
      maksimal: 50,
      persentase: 0,
      status: "Perlu Perhatian" as const,
      ringkasan:
        "Kamu belum membuat budget apapun. Buat budget untuk mulai melacak pengeluaranmu.",
    };
  }

  let kategoriDalamBatas = 0;

  for (const budget of listBudgeting) {
    const transaksiDalamPeriode = await TransaksiModel.find({
      user: userId,
      kategori: budget.Kategori_Budget,
      tipe: "pengeluaran",
      tanggal: { $gte: budget.Tanggal_Mulai, $lte: budget.Tanggal_Selesai },
    });

    const terpakai = transaksiDalamPeriode.reduce(
      (acc, t) => acc + (t.nominal ?? 0),
      0,
    );

    if (terpakai <= budget.Batas_PerBulan) {
      kategoriDalamBatas++;
    }
  }

  const totalKategori = listBudgeting.length;
  const rasio = kategoriDalamBatas / totalKategori; // 0 - 1
  const skor = Math.round(rasio * 50);

  let status: "Excellent" | "Good" | "Perlu Perhatian" | "Buruk";
  if (rasio >= 0.9) status = "Excellent";
  else if (rasio >= 0.7) status = "Good";
  else if (rasio >= 0.4) status = "Perlu Perhatian";
  else status = "Buruk";

  const ringkasan =
    kategoriDalamBatas === totalKategori
      ? "Semua pengeluaran bulan ini masih sesuai dengan batas anggaran yang kamu buat. Mantap, berarti kamu cukup disiplin dalam mengatur pengeluaran."
      : `Ada ${
          totalKategori - kategoriDalamBatas
        } dari ${totalKategori} kategori budget yang sudah melebihi batas. Coba lebih perhatikan pengeluaran di kategori tersebut.`;

  return {
    skor,
    maksimal: 50,
    persentase: Math.round(rasio * 100),
    status,
    ringkasan,
  };
};

const hitungPengelolaanPinjaman = async (userId: string) => {
  const listPinjaman = await PinjamanModel.find({ user: userId });

  // Ambil total pemasukan pakai transaksi 30 hari terakhir sebagai pemasukan bulanan
  const tigaPuluhHariLalu = new Date();
  tigaPuluhHariLalu.setDate(tigaPuluhHariLalu.getDate() - 30);

  const transaksiPemasukan = await TransaksiModel.find({
    user: userId,
    tipe: "pemasukan",
    tanggal: { $gte: tigaPuluhHariLalu },
  });
  const totalPemasukan = transaksiPemasukan.reduce(
    (acc, t) => acc + (t.nominal ?? 0),
    0,
  );

  if (listPinjaman.length === 0) {
    return {
      skor: 50,
      maksimal: 50,
      persentase: 0,
      status: "Excellent" as const,
      ringkasan:
        "Kamu tidak memiliki pinjaman aktif saat ini. Kondisi ini sangat baik untuk kesehatan keuanganmu.",
    };
  }

  const kewajibanPerbulan = listPinjaman.reduce((acc, item) => {
    if (item.statusPinjaman !== "Lunas")
      return acc + (item.cicilanBulanan ?? 0);
    return acc;
  }, 0);

  // Rasio cicilan terhadap pemasukan
  const rasioDTI = totalPemasukan > 0 ? kewajibanPerbulan / totalPemasukan : 1;

  let skor: number;
  let status: "Excellent" | "Good" | "Perlu Perhatian" | "Buruk";

  if (rasioDTI <= 0.3) {
    skor = 50;
    status = "Excellent";
  } else if (rasioDTI <= 0.5) {
    skor = 35;
    status = "Good";
  } else if (rasioDTI <= 0.7) {
    skor = 20;
    status = "Perlu Perhatian";
  } else {
    skor = 5;
    status = "Buruk";
  }

  const persentase = Math.round(rasioDTI * 100);
  const ringkasan = `Sekitar ${persentase}% pemasukanmu masih digunakan untuk membayar cicilan. ${
    rasioDTI <= 0.3
      ? "Kondisi ini sangat aman."
      : rasioDTI <= 0.5
        ? "Masih aman, tapi usahakan jangan bertambah supaya keuangan tetap sehat."
        : "Ini sudah cukup berat, sebaiknya prioritaskan pelunasan cicilan sebelum ambil pinjaman baru."
  }`;

  return { skor, maksimal: 50, persentase, status, ringkasan };
};

const tentukanGrade = (skorTotal: number): "A" | "B" | "C" | "D" | "E" => {
  if (skorTotal >= 85) return "A";
  if (skorTotal >= 70) return "B";
  if (skorTotal >= 55) return "C";
  if (skorTotal >= 40) return "D";
  return "E";
};

export const hitungDanSimpanFinancialHealth = async (userId: string) => {
  const disiplinAnggaran = await hitungDisiplinAnggaran(userId);
  const pengelolaanPinjaman = await hitungPengelolaanPinjaman(userId);

  const skorTotal = disiplinAnggaran.skor + pengelolaanPinjaman.skor;
  const grade = tentukanGrade(skorTotal);

  // kalau sudah ada record untuk user ini, timpa. Kalau belum, buat baru.
  const financialHealth = await FinancialHealthModel.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      skorTotal,
      grade,
      disiplinAnggaran: { ...disiplinAnggaran, saranPerkembangan: [] },
      pengelolaanPinjaman: { ...pengelolaanPinjaman, saranPerkembangan: [] },
    },
    { new: true, upsert: true, runValidators: true },
  );

  return financialHealth;
};

export const postFinancialHealth = async (req: IReqUser, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User tidak teridentifikasi" });
  }

  // 🟢 1. PASANG HEADER SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    // 2. Jalankan logika kalkulasi matematika
    const disiplinAnggaran = await hitungDisiplinAnggaran(userId.toString());
    const pengelolaanPinjaman = await hitungPengelolaanPinjaman(
      userId.toString(),
    );
    const skorTotal = disiplinAnggaran.skor + pengelolaanPinjaman.skor;
    const grade = tentukanGrade(skorTotal);

    // 🤖 3. Panggil askAIStream untuk mendapatkan saran & narasi AI
    const aiResponse = (await askAIStream(
      JSON.stringify({
        skorTotal,
        grade,
        disiplinAnggaran,
        pengelolaanPinjaman,
      }),
      res,
    )) as unknown as IAIResult;

    // Fallback saran jika terjadi kendala pada respon AI
    const saranDisiplin = aiResponse?.disiplinAnggaran?.saranPerkembangan || [
      "Tetap catat setiap pengeluaran sekecil apa pun.",
      "Sisihkan uang tabungan di awal bulan, bukan di akhir.",
      "Kalau ada sisa budget, simpan ke tabungan daripada dihabiskan.",
    ];

    const saranPinjaman = aiResponse?.pengelolaanPinjaman
      ?.saranPerkembangan || [
      "Prioritaskan melunasi utang dengan bunga paling tinggi.",
      "Tunda ambil pinjaman baru kalau belum benar-benar perlu.",
      "Kalau ada uang lebih, coba bayar cicilan lebih awal.",
    ];

    // 💾 4. Simpan/Update ke Database dengan data gabungan
    const financialHealth = await FinancialHealthModel.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        skorTotal,
        grade,
        disiplinAnggaran: {
          ...disiplinAnggaran,
          ringkasan:
            aiResponse?.disiplinAnggaran?.ringkasan ||
            disiplinAnggaran.ringkasan,
          saranPerkembangan: saranDisiplin,
        },
        pengelolaanPinjaman: {
          ...pengelolaanPinjaman,
          ringkasan:
            aiResponse?.pengelolaanPinjaman?.ringkasan ||
            pengelolaanPinjaman.ringkasan,
          saranPerkembangan: saranPinjaman,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    // 🎯 5. Kirim event done beserta payload data final
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        message: "Berhasil menghitung detail Financial Health",
        data: financialHealth,
      })}\n\n`,
    );
  } catch (error: any) {
    console.error("❌ Error pada postFinancialHealth:", error.message);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Gagal menghitung Financial Health",
        error: String(error.message || error),
      })}\n\n`,
    );
  } finally {
    // 🔒 6. Tutup koneksi SSE stream
    res.end();
  }
};

export const getFinancialHealth = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    const latestData = await FinancialHealthModel.findOne({ user: userId })
      .select(
        "skorTotal grade disiplinAnggaran pengelolaanPinjaman createdAt updatedAt",
      )
      .sort({ updatedAt: -1 });

    if (!latestData) {
      return res.status(200).json({
        message: "Belum ada data Financial Health",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil data Financial Health terbaru",
      data: latestData,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Gagal mengambil data Financial Health",
        error: String(error),
      });
  }
};
