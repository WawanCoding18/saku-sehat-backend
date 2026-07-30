// src/models/financialHealth.model.ts
import mongoose from "mongoose";

export interface ISubScore {
  skor: number;              // misal 17, dari 25
  maksimal: number;          // 25
  persentase: number;        // 40% (nilai kamu : X dari Y)
  status: "Excellent" | "Good" | "Perlu Perhatian" | "Buruk";
  ringkasan: string;         // teks penjelasan ("Semua pengeluaran bulan ini masih sesuai...")
  saranPerkembangan: string[]; // array bullet saran, boleh kosong dulu (AI diabaikan sementara)
}

export interface IFinancialHealth {
  user: mongoose.Types.ObjectId;
  skorTotal: number;          // 87
  grade: "A" | "B" | "C" | "D" | "E";
  // targetNabung: ISubScore;
  disiplinAnggaran: ISubScore;
  pengelolaanPinjaman: ISubScore;
}

const SubScoreSchema = new mongoose.Schema<ISubScore>(
  {
    skor: { type: Number, required: true },
    maksimal: { type: Number, required: true, default: 25 },
    persentase: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Excellent", "Good", "Perlu Perhatian", "Buruk"],
      required: true,
    },
    ringkasan: { type: String, required: true },
    saranPerkembangan: { type: [String], default: [] },
  },
  { _id: false } // sub-dokumen, tidak perlu _id sendiri
);

const FinancialHealthSchema = new mongoose.Schema<IFinancialHealth>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 user cuma punya 1 record Financial Health yang terus di-update
    },
    skorTotal: { type: Number, required: true, min: 0, max: 100 },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      required: true,
    },
    // targetNabung: { type: SubScoreSchema, required: true },
    disiplinAnggaran: { type: SubScoreSchema, required: true },
    pengelolaanPinjaman: { type: SubScoreSchema, required: true },
  },
  { timestamps: true } // updatedAt otomatis jadi "Terakhir di update"
);

const FinancialHealthModel = mongoose.model<IFinancialHealth>(
  "financialHealth",
  FinancialHealthSchema
);
export default FinancialHealthModel;