// import { createWorker, Worker, PSM } from 'tesseract.js';
// import sharp from "sharp";

// let workerInstance: Worker | null = null;

// const getWorker = async (): Promise<Worker> => {
//   if (!workerInstance) {
//     // 💡 Pakai gabungan Bahasa Indonesia + Inggris untuk istilah kasir/struk
//     workerInstance = await createWorker(["ind", "eng"]);
//   }
//   return workerInstance;
// };

// export const scanText = async (
//   imageBuffer: Buffer
// ): Promise<string> => {
//   const startTime = performance.now();

//   // 1. Preprocessing dengan Sharp
//   const processedBuffer = await sharp(imageBuffer)
//     .rotate() // 👈 SANGAT KRUSIAL: Auto-rotate berdasarkan EXIF kamera HP!
//     .resize({ 
//       width: 1800, 
//       fit: 'inside', 
//       withoutEnlargement: false 
//     })
//     .grayscale()
//     .sharpen()
//     .normalize()
//     .toBuffer();

//   // 2. Jalankan Tesseract
//   const worker = await getWorker();
  
//   await worker.setParameters({
//     // 💡 PSM 6 (SINGLE_BLOCK) atau 4 (SINGLE_COLUMN) sangat cocok untuk layout struk
//     tessedit_pageseg_mode: PSM.SINGLE_BLOCK, 
//   });

//   const result = await worker.recognize(processedBuffer);

//   const durationMs = performance.now() - startTime;
//   const durationSec = (durationMs / 1000).toFixed(2);

//   console.log(`\n⏱️ [TESSERACT OCR COMPLETED]`);
//   console.log(`├─ Durasi Proses : ${durationMs.toFixed(2)} ms (${durationSec} detik)`);
//   console.log(`└─ Teks Extracted :\n${result.data.text}`);

//   return result.data.text; 
// };


import axios from "axios";
import FormData from "form-data";

// Type definitions matching FastAPI response structure
export interface OCRItem {
  box: number[][];
  text: string;
  confidence: number;
}

export interface PaddleOCRResponse {
  result: OCRItem[];
  processing_time_ms?: number;
}

/**
 * Forwards an image buffer to the FastAPI PaddleOCR microservice
 */
export const scanTextPaddle = async (
  imageBuffer: Buffer,
  originalName: string = "image.png",
): Promise<PaddleOCRResponse> => {
  const startTime = performance.now();

  // Prepare multipart form data payload
  const formData = new FormData();
  formData.append("file", imageBuffer, {
    filename: originalName,
    contentType: "image/png",
  });

  try {
    // Send request to FastAPI Python service
    const response = await axios.post<PaddleOCRResponse>(
      "http://127.0.0.1:8000/ocr",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 120000, // 30 second timeout
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
    );

    const durationMs = performance.now() - startTime;
    const durationSec = (durationMs / 1000).toFixed(2);
    console.log(`\n⏱️ [PADDLEOCR HTTP COMPLETED]`);
    console.log(`├─ Duration Express -> FastAPI : ${durationMs.toFixed(2)} ms (${durationSec} detik)`);
    console.log(`└─ Lines Detected : ${response.data.result.length}`);
    // `├─ Waktu Respons     : ${durationMs.toFixed(2)} ms (${durationSec} detik)`,

    return {
      ...response.data,
      processing_time_ms: parseFloat(durationMs.toFixed(2)),
    };
  } catch (error: any) {
    console.error(
      "❌ Error communicating with PaddleOCR service:",
      error.message,
    );
    throw new Error("Failed to process image with PaddleOCR microservice.");
  }
};
