import { Request, Response } from "express";
import { askAIStream } from "../services/ai.services";
import { scanText } from "../services/ocr.services";
import TransaksiModel from "../models/transaksi.model";

// 1. Interface khusus untuk type-checking balikan AI
interface AIResult {
  tipe?: "pengeluaran" | "pemasukan";
  kategori?: string;
  namaMerchant?: string;
  nominal?: number;
  tanggal?: string;
}

export const handleOcrUpload = async (req: Request, res: Response) => {
  const imageBuffer = req.file?.buffer;
  if (!imageBuffer) {
    return res.status(400).json({ error: "Gambar tidak boleh kosong" });
  }

  // Set Header Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // 1. Ekstraksi teks via Tesseract OCR
    const ocrText = await scanText(imageBuffer);

    // 2. Kirim ke AI Stream untuk ekstrak JSON (di-cast ke interface AIResult)
    const result = (await askAIStream(ocrText, res)) as unknown as AIResult;

    // 3. Simpan ke MongoDB via Mongoose
    let savedTransaction = null;

    if (result && typeof result === "object") {
      const userId = (req as any).user?.id || (req as any).user?._id;

      // Validasi Tanggal yang Aman
      let parsedDate = new Date(result.tanggal || "");
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date(); // Fallback ke hari ini jika tanggal dari AI invalid
      }

      // Susun object payload dengan tipe 'any' agar fleksibel dengan Schema Mongoose
      const payload: Record<string, any> = {
        tipe: result.tipe || "pengeluaran",
        kategori: result.kategori || "Lainnya",
        namaMerchant: result.namaMerchant || "Unknown",
        nominal: Number(result.nominal) || 0,
        tanggal: parsedDate,
      };

      // Tambahkan user jika userId ditemukan dari middleware auth
      if (userId) {
        payload.user = userId;
      }

      // Simpan ke database
      savedTransaction = await TransaksiModel.create(payload);

      console.log(`🍃 [DATABASE] Transaksi OCR disimpan! ID: ${savedTransaction._id}`);
    }

    // 4. Kirim respon 'done' SSE
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        result,
        data: savedTransaction,
      })}\n\n`
    );
  } catch (error: any) {
    console.error("❌ Gagal proses scan & simpan transaksi:", error.message);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        text: "Gagal menganalisis gambar atau menyimpan transaksi",
      })}\n\n`
    );
  } finally {
    res.end(); // Menutup koneksi SSE
  }
};