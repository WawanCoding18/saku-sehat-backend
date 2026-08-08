import mongoose, { Schema, Document } from "mongoose";

export interface IBeforeYouBorrow extends Document {
  user: mongoose.Types.ObjectId;
  Nama_Platform: string;
  Tujuan_Meminjam: string;
  Jumlah_Pinjaman: number;
  Pemasukan_PerBulan: number;
  Pengeluaran_PerBulan: number;
  Nominal_Pinjaman_Saat_Ini: number;
  levelKelayakan?: "Layak" | "Perlu Pertimbangan" | "Tidak Disarankan";
  score?: number;
  riskLevel?: "Risiko Rendah" | "Risiko Sedang" | "Risiko Tinggi";
  hasilAsesmen?: {
    reasoning?: string;
    recommendation?: string;
    alternativeAction?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const BeforeYouBorrowSchema = new Schema<IBeforeYouBorrow>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Nama_Platform: {
      type: String,
      required: true,
    },
    Tujuan_Meminjam: {
      type: String,
      required: true,
    },
    Jumlah_Pinjaman: {
      type: Number,
      required: true,
      min: 0,
    },
    Pemasukan_PerBulan: {
      type: Number,
      required: true,
      min: 0,
    },
    Pengeluaran_PerBulan: {
      type: Number,
      required: true,
      min: 0,
    },
    Nominal_Pinjaman_Saat_Ini: {
      type: Number,
      required: true,
      min: 0,
    },
    levelKelayakan: {
      type: String,
      enum: ["Layak", "Perlu Pertimbangan", "Tidak Disarankan"],
      required: false,
    },
    score: {
      type: Number,
      required: false,
    },
    riskLevel: {
      type: String,
      enum: ["Risiko Rendah", "Risiko Sedang", "Risiko Tinggi"],
      required: false,
    },
    hasilAsesmen: {
      reasoning: {
        type: String,
        required: false,
      },
      recommendation: {
        type: String,
        required: false,
      },
      alternativeAction: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true }
);

const BeforeYouBorrowModel = mongoose.model<IBeforeYouBorrow>(
  "BeforeYouBorrow",
  BeforeYouBorrowSchema
);

export default BeforeYouBorrowModel;