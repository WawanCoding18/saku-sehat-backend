import { Request, Response } from "express";
import { askAIStream } from "../services/aiCariAman.services";
import { checkOjkLegality } from "../services/ojk.services";

/**
 * 1. CONTROLLER UNTUK TEKS (PESAN CHAT)
 */
export const postCariAman = async (req: Request, res: Response) => {
  const { message } = req.body;

  // Validasi input teks
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message tidak boleh kosong" });
  }

  // Header SSE (Server-Sent Events)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // 1. Cek legalitas OJK berdasarkan isi pesan/nama entitas
    const ojkResult = await checkOjkLegality(message);

    // 2. Stream analisis teks ke AI Provider (Gemini / Groq)
    const result = await askAIStream(
      message,
      ojkResult.is_ojk_legal ? "Terdaftar Resmi" : "Tidak Ditemukan",
      res
    );

    // 3. Kirim signal done ke client
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
    res.end(); // Tutup koneksi SSE
  }
};

// export const handleOcrUpload = async (req: Request, res: Response) => {
//   const imageBuffer = req.file?.buffer;
//   if (!imageBuffer) {
//     return res.status(400).json({ error: "Gambar tidak boleh kosong" });
//   }

//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   try {
//     const ocrResult = await scanTextPaddle(imageBuffer);

//     // Extract plain text from Paddle OCR response
//     const ocrText: string = (() => {
//       if (!ocrResult) return "";
      
//       // Handle when scanTextPaddle returns { result: [ { text: "...", box: ... } ] }
//       if (typeof ocrResult === "object" && Array.isArray((ocrResult as any).result)) {
//         return (ocrResult as any).result
//           .map((item: any) => (typeof item === "string" ? item : item.text || ""))
//           .filter(Boolean)
//           .join(" ");
//       }

//       if (typeof ocrResult === "string") return ocrResult;

//       if (Array.isArray(ocrResult)) {
//         return ocrResult
//           .map((item: any) => (typeof item === "string" ? item : item.text || ""))
//           .filter(Boolean)
//           .join(" ");
//       }

//       if (typeof ocrResult === "object") {
//         if (typeof (ocrResult as any).text === "string") return (ocrResult as any).text;
//         if (Array.isArray((ocrResult as any).text)) return (ocrResult as any).text.join(" ");
//         if (Array.isArray((ocrResult as any).lines)) return (ocrResult as any).lines.join(" ");
//       }

//       return String(ocrResult);
//     })();

//     // Debug log to verify text extraction
//     console.log("📝 Extracted OCR Text:", ocrText);

//     if (!ocrText || ocrText === "[object Object]") {
//       throw new Error("Gagal mengekstrak teks dari respon OCR");
//     }

//     const ojkResult = await checkOjkLegality(ocrText);

//     const result = await askAIStream(
//       ocrText,
//       ojkResult.is_ojk_legal ? "Terdaftar Resmi" : "Tidak Ditemukan",
//       res
//     );

//     res.write(`data: ${JSON.stringify({ type: "done", result })}\n\n`);
//   } catch (error: any) {
//     console.error("Gagal proses gambar:", error.message);
//     res.write(`data: ${JSON.stringify({ type: "error", text: error.message || "Gagal menganalisis gambar" })}\n\n`);
//   } finally {
//     res.end(); // Closes the SSE connection
//   }
// };
