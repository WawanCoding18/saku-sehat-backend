import { createWorker, Worker, PSM } from 'tesseract.js';
import sharp from "sharp";

let workerInstance: Worker | null = null;

const getWorker = async (): Promise<Worker> => {
  if (!workerInstance) {
    workerInstance = await createWorker(["ind", "eng"]);
  }
  return workerInstance;
};

export const scanText = async (
  imageBuffer: Buffer
): Promise<string> => {
  const startTime = performance.now();

  // 1. Kostumisasi dengan Sharp
  const processedBuffer = await sharp(imageBuffer)
    .rotate() 
    .resize({ 
      width: 1800, 
      fit: 'inside', 
      withoutEnlargement: false 
    })
    .grayscale()
    .sharpen()
    .normalize()
    .toBuffer();

  // 2. Jalankan fungsi dari Tesseract
  const worker = await getWorker();
  
  await worker.setParameters({
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