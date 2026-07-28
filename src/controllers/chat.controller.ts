import { Request, Response } from "express";
import { askAIStream } from "../services/ai.services";
import { scanText } from "../services/ocr.services";
import TransaksiModel from "../models/transaksi.model";

interface AIResult {
  tipe?: "pengeluaran" | "pemasukan";
  kategori?: string;
  Catatan_Transaksi?: string;
  Sumber_Dana?: string;
  nominal?: number;
  tanggal?: string;
}

export const handleOcrUpload = async (req: Request, res: Response) => {
  const imageBuffer = req.file?.buffer;
  if (!imageBuffer) {
    return res.status(400).json({ error: "Gambar tidak boleh kosong" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const ocrText = await scanText(imageBuffer);
    const result = (await askAIStream(ocrText, res)) as unknown as AIResult;

    let savedTransaction = null;

    if (result && typeof result === "object") {
      const userId = (req as any).user?.id || (req as any).user?._id;

      // Kalau user nggak teridentifikasi, langsung gagalkan proses,
      // jangan lanjut nyimpen (karena bakal pasti gagal validasi juga)
      if (!userId) {
        throw new Error("User tidak teridentifikasi, gagal menyimpan transaksi");
      }

      let parsedDate = new Date(result.tanggal || "");
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date();
      }

      const payload: Record<string, any> = {
        user: userId,
        tipe: result.tipe || "pengeluaran",
        kategori: result.kategori || "Lainnya",
        Catatan_Transaksi: result.Catatan_Transaksi || "Transaksi dari scan struk",
        Sumber_Dana: result.Sumber_Dana || "Lainnya",
        nominal: Number(result.nominal) || 0,
        tanggal: parsedDate,
      };

      savedTransaction = await TransaksiModel.create(payload);

      console.log(`🍃 [DATABASE] Transaksi OCR disimpan! ID: ${savedTransaction._id}`);
    }

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
    res.end();
  }
};