import { Request, Response } from "express";
import { askAIStream } from "../services/ai.services";
import { scanText } from "../services/ocr.services";
import TransaksiModel from "../models/transaksi.model";

//Interface khusus untuk type-checking
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

  //Header Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    //Ekstraksi teks pake Tesseract OCR
    const ocrText = await scanText(imageBuffer);

    //Kirim ke AI Stream untuk ekstrak ke JSON
    const result = (await askAIStream(ocrText, res)) as unknown as AIResult;

    //Simpan ke MongoDB
    let savedTransaction = null;

    if (result && typeof result === "object") {
      const userId = (req as any).user?.id || (req as any).user?._id;

      // Validasi Tanggal
      let parsedDate = new Date(result.tanggal || "");
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date();
      }

      // Susun payload dengan tipe 'any' supaya fleksibel dengan Schema Mongoose
      const payload: Record<string, any> = {
        tipe: result.tipe || "pengeluaran",
        kategori: result.kategori || "Lainnya",
        namaMerchant: result.namaMerchant || "Unknown",
        nominal: Number(result.nominal) || 0,
        tanggal: parsedDate,
      };

      if (userId) {
        payload.user = userId;
      }

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