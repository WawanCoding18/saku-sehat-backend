import { Request, Response } from "express";
import { askAIStream } from "../services/ai.services";
import { scanTextPaddle  } from "../services/ocr.services";


export const handleOcrUpload = async (req: Request, res: Response) => {
  const imageBuffer = req.file?.buffer;
  if (!imageBuffer) {
    return res.status(400).json({ error: "Gambar tidak boleh kosong" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const ocrResult = await scanTextPaddle(imageBuffer);

    // Ekstra teks dari respon Paddle OCR
    const ocrText: string = (() => {
      if (!ocrResult) return "";
      
      if (typeof ocrResult === "object" && Array.isArray((ocrResult as any).result)) {
        return (ocrResult as any).result
          .map((item: any) => (typeof item === "string" ? item : item.text || ""))
          .filter(Boolean)
          .join(" ");
      }

      if (typeof ocrResult === "string") return ocrResult;

      if (Array.isArray(ocrResult)) {
        return ocrResult
          .map((item: any) => (typeof item === "string" ? item : item.text || ""))
          .filter(Boolean)
          .join(" ");
      }

      if (typeof ocrResult === "object") {
        if (typeof (ocrResult as any).text === "string") return (ocrResult as any).text;
        if (Array.isArray((ocrResult as any).text)) return (ocrResult as any).text.join(" ");
        if (Array.isArray((ocrResult as any).lines)) return (ocrResult as any).lines.join(" ");
      }

      return String(ocrResult);
    })();

    console.log("📝 Extracted OCR Text:", ocrText);

    if (!ocrText || ocrText === "[object Object]") {
      throw new Error("Gagal mengekstrak teks dari respon OCR");
    }


    const result = await askAIStream(
      ocrText,
      res
    );

    res.write(`data: ${JSON.stringify({ type: "done", result })}\n\n`);
  } catch (error: any) {
    console.error("Gagal proses gambar:", error.message);
    res.write(`data: ${JSON.stringify({ type: "error", text: error.message || "Gagal menganalisis gambar" })}\n\n`);
  } finally {
    res.end(); // Menutup koneksi SSE
  }
};
