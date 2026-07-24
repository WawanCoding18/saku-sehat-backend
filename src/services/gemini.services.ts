import "dotenv/config";
import { aiConfig } from "../utils/config/ai.config";
import { GoogleGenAI, Type } from "@google/genai";
import { getFullSystemInstruction } from "../utils/prompts";

// Client khusus Teks (menggunakan API Key dari config)
const aiText = new GoogleGenAI({ apiKey: aiConfig.gemini.apiKey });

// ==== 1. STREAM GEMINI TEKS ====
export const streamGemini = async (
  message: string,
  res: any
): Promise<void> => {
  // Ambil system instruction dinamis yang sudah ter-inject tanggal server hari ini
  const dynamicSystemInstruction = getFullSystemInstruction();

  const userMsgLength = message?.length || 0;
  const systemPromptLength = dynamicSystemInstruction?.length || 0;

  // 🔍 [DEBUG DATA TEXT]
  const totalChars = userMsgLength + systemPromptLength;
  const estimatedTokens = Math.ceil(totalChars / 3.5);

  console.log("--------------------------------------------------");
  console.log("💬 [DEBUG DATA TEXT]");
  console.log(" Panjang Pesan User   :", userMsgLength, "karakter");
  console.log(" Panjang System Prompt:", systemPromptLength, "karakter");
  console.log(" Total Karakter Teks  :", totalChars, "karakter");
  console.log(" Est. Input Tokens    : ~" + estimatedTokens, "tokens");
  console.log("--------------------------------------------------");

  const responseStream = await aiText.models.generateContentStream({
    model: aiConfig.gemini.model,
    contents: `Teks/hasil OCR dari pengguna:\n"""${message}"""`,
    config: {
      systemInstruction: dynamicSystemInstruction,
      responseMimeType: "application/json",
      // 🔒 Mengunci struktur output dengan Schema bawaan SDK Gemini
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tipe: { 
            type: Type.STRING, 
            enum: ["pengeluaran", "pemasukan"] 
          },
          kategori: { 
            type: Type.STRING,
            enum: ["Hiburan", "Makanan", "Transportasi", "Belanja", "Tagihan", "Kesehatan", "Gaji", "Lainnya"]
          },
          namaMerchant: { 
            type: Type.STRING,
            description: "Nama brand/toko utama (misal: 'Indomaret', 'Loemplia Bom'). Jangan isi nama item makanan!"
          },
          nominal: { 
            type: Type.NUMBER,
            description: "Nilai total bayar angka murni"
          },
          tanggal: { 
            type: Type.STRING, 
            description: "Format YYYY-MM-DD. Wajib mengunci tanggal dari OCR jika ada (contoh '16.06.18' -> '2018-06-16', '05.09.17' -> '2017-09-05'). Jika tidak ada, gunakan tanggal hari ini dari prompt."
          },
        },
        required: ["tipe", "kategori", "namaMerchant", "nominal", "tanggal"],
      },
      temperature: 0.0, // 👈 Zero temperature agar AI tidak halusinasi
      maxOutputTokens: 2048,
    },
  });

  for await (const chunk of responseStream) {
    const parts = chunk.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text) {
        res.write(
          `data: ${JSON.stringify({ type: "answer", text: part.text })}\n\n`
        );
      }
    }
  }
};