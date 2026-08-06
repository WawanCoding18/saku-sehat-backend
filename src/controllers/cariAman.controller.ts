import { Request, Response } from "express";
import { askAIStream } from "../services/aiCariAman.services";
import { checkOjkLegality } from "../services/ojk.services";


export const postCariAman = async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message tidak boleh kosong" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    //Cek legalitas OJK berdasarkan isi pesan/nama entitas
    const ojkResult = await checkOjkLegality(message);

    //Stream analisis teks ke AI Provider (Gemini / Groq)
    const result = await askAIStream(
      message,
      ojkResult.is_ojk_legal ? "Terdaftar Resmi" : "Tidak Ditemukan",
      res
    );

    // Kirim signal done ke client
    res.write(`data: ${JSON.stringify({ type: "done", result })}\n\n`);
  } catch (error: any) {
    console.error("Semua provider gagal (Text):", error.message);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        text: "Gagal menganalisis pesan, silakan coba lagi",
      })}\n\n`
    );
  } finally {
    res.end();
  }
};