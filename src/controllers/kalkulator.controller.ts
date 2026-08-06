import { Request, Response } from "express";
import SimulasiPinjamanModel from "../models/kalkulator.model";
import { IReqUser } from "../middlewares/auth.Middleware";
import { askAIStream } from "../services/ai.KalkulatorBunga.services";

// Tipe data khusus untuk menampung respon dari AI
interface IAIResult {
  levelRisiko: "Rendah" | "Sedang" | "Tinggi";
  analisisAI: string;
}

// Hitung & Simpan Simulasi Kalkulator Bunga
export const postKalkulatorBunga = async (req: IReqUser, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User tidak teridentifikasi" });
  }

  const {
    jumlahPinjaman,
    bungaPerBulan,
    tenorCicilan,
    dendaPerHari,
    deadlineTarget,
  } = req.body;

  const pokok = Number(jumlahPinjaman);
  const bunga = Number(bungaPerBulan);
  const tenor = Number(tenorCicilan);
  const denda = Number(dendaPerHari) || 0;

  // 1. Validasi Input (Sebelum SSE Header dipasang)
  if (!pokok || pokok <= 0) {
    return res
      .status(400)
      .json({ message: "Jumlah Pinjaman harus lebih dari 0" });
  }
  if (bunga === undefined || bunga < 0) {
    return res.status(400).json({ message: "Bunga per Bulan tidak valid" });
  }
  if (!tenor || tenor <= 0) {
    return res
      .status(400)
      .json({ message: "Tenor Cicilan harus lebih dari 0 bulan" });
  }

  // RUMUS KALKULASI (Bunga Flat Rate per Bulan)
  const totalBunga = pokok * (bunga / 100) * tenor;
  const totalPembayaran = pokok + totalBunga;
  const totalBayarPerBulan = totalPembayaran / tenor;
  const bungaEfektifTahunan = (Math.pow(1 + bunga / 100, 12) - 1) * 100;

  // 🟢 2. PASANG HEADER SSE DI SINI (WAJIB SEBELUM askAIStream DIPANGGIL)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.(); // Langsung kunci header ke client

  try {
    // 🤖 3. Panggil AI Stream (Sekarang aman karena SSE Header sudah terpasang)
    const aiResponse = (await askAIStream(
      JSON.stringify({
        jumlahPinjaman: pokok,
        bungaPerBulan: bunga,
        tenorCicilan: tenor,
        dendaPerHari: denda,
        totalBunga: Number(totalBunga.toFixed(2)),
        totalPembayaran: Number(totalPembayaran.toFixed(2)),
        totalBayarPerBulan: Number(totalBayarPerBulan.toFixed(2)),
        bungaEfektifTahunan: Number(bungaEfektifTahunan.toFixed(1)),
      }),
      res
    )) as IAIResult;

    const levelRisiko =
      aiResponse?.levelRisiko ||
      (bunga > 4 ? "Tinggi" : bunga > 2 ? "Sedang" : "Rendah");
    const analisisAI =
      aiResponse?.analisisAI ||
      "Cicilan ini masih tergolong aman jika **tidak melebihi 30% dari penghasilan bulanan**. Jaga pembayaran tepat waktu.";

    // 💾 4. SIMPAN KE DATABASE
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
      levelRisiko: levelRisiko,
      analisisAI: analisisAI,
    });

    // 🎯 5. Kirim event done beserta data simulasi baru
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        message: "Berhasil menghitung dan menyimpan simulasi",
        data: newSimulasi,
      })}\n\n`
    );
  } catch (error: any) {
    console.error("❌ Error pada postKalkulatorBunga:", error.message);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Gagal menghitung simulasi",
        error: String(error.message || error),
      })}\n\n`
    );
  } finally {
    // 🔒 6. Tutup koneksi SSE stream
    res.end();
  }
};

export const getAllKalkulatorBunga = async (req: IReqUser, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User tidak teridentifikasi" });
    }

    const dataList = await SimulasiPinjamanModel.find({ user: userId })
      .select(
        "jumlahPinjaman bungaPerBulan tenorCicilan dendaPerHari totalBunga totalPembayaran totalBayarPerBulan bungaEfektifTahunan levelRisiko analisisAI createdAt"
      )
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