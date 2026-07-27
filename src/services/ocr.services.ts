import { createWorker, Worker, PSM } from 'tesseract.js';
import sharp from "sharp";

let workerInstance: Worker | null = null;

const getWorker = async (): Promise<Worker> => {
  if (!workerInstance) {
    // 💡 Pakai gabungan Bahasa Indonesia + Inggris untuk istilah kasir/struk
    workerInstance = await createWorker(["ind", "eng"]);
  }
  return workerInstance;
};

export const scanText = async (
  imageBuffer: Buffer
): Promise<string> => {
  const startTime = performance.now();

  // 1. Preprocessing dengan Sharp
  const processedBuffer = await sharp(imageBuffer)
    .rotate() // 👈 SANGAT KRUSIAL: Auto-rotate berdasarkan EXIF kamera HP!
    .resize({ 
      width: 1800, 
      fit: 'inside', 
      withoutEnlargement: false 
    })
    .grayscale()
    .sharpen()
    .normalize()
    .toBuffer();

  // 2. Jalankan Tesseract
  const worker = await getWorker();
  
  await worker.setParameters({
    // 💡 PSM 6 (SINGLE_BLOCK) atau 4 (SINGLE_COLUMN) sangat cocok untuk layout struk
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK, 
  });

  const result = await worker.recognize(processedBuffer);

  const durationMs = performance.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(2);

  console.log(`\n⏱️ [TESSERACT OCR COMPLETED]`);
  console.log(`├─ Durasi Proses : ${durationMs.toFixed(2)} ms (${durationSec} detik)`);
  console.log(`└─ Teks Extracted :\n${result.data.text}`);

  return result.data.text; 
};