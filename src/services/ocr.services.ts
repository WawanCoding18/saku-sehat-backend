import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";

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
 * Compresses/resizes image buffer and forwards to FastAPI PaddleOCR microservice
 */
export const scanTextPaddle = async (
  imageBuffer: Buffer,
  originalName: string = "image.jpg"
): Promise<PaddleOCRResponse> => {
  const startTime = performance.now();

  try {
    // ⚡ Resize large images (e.g. 4K camera photos) down to max 1024px before sending
    // This drops CPU processing time from ~140s down to 1-3 seconds.
    const resizedBuffer = await sharp(imageBuffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Prepare multipart form data payload
    const formData = new FormData();
    formData.append("file", resizedBuffer, {
      filename: originalName.replace(/\.[^/.]+$/, "") + ".jpg",
      contentType: "image/jpeg",
    });

    // Send request to FastAPI Python service
    const response = await axios.post<PaddleOCRResponse>(
      "http://127.0.0.1:8000/ocr",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 120000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    const durationMs = performance.now() - startTime;
    const durationSec = (durationMs / 1000).toFixed(2);
    console.log(`\n⏱️ [PADDLEOCR HTTP COMPLETED]`);
    console.log(`├─ Duration Express -> FastAPI : ${durationMs.toFixed(2)} ms (${durationSec} detik)`);
    console.log(`└─ Lines Detected : ${response.data.result?.length || 0}`);

    return {
      ...response.data,
      processing_time_ms: parseFloat(durationMs.toFixed(2)),
    };
  } catch (error: any) {
    console.error(
      "❌ Error communicating with PaddleOCR service:",
      error.message
    );
    throw new Error("Failed to process image with PaddleOCR microservice.");
  }
};