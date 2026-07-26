import mongoose from "mongoose";

export interface Transaksi {
  user: mongoose.Types.ObjectId;
  tipe: "pengeluaran" | "pemasukan";
  kategori: string;
  namaMerchant: string;
  nominal: number;
  tanggal: Date;
  createdAt?: string;
}

const TransaksiSchema = new mongoose.Schema<Transaksi>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tipe: {
      type: String,
      enum: ["pengeluaran", "pemasukan"],
      required: true,
    },
    kategori: {
      type: String,
      enum: [
        "Hiburan",
        "Makanan",
        "Transportasi",
        "Belanja",
        "Tagihan",
        "Kesehatan",
        "Gaji",
        "Lainnya",
      ],
      required: true,
    },
    namaMerchant: {
      type: String,
      required: true,
    },
    nominal: {
      type: Number,
      required: true,
      min: 0,
    },
    tanggal: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TransaksiModel = mongoose.model<Transaksi>("Transaksi", TransaksiSchema);

export default TransaksiModel;