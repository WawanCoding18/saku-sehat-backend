import mongoose from "mongoose";

export interface IBeforeYouBorrow {
  user: mongoose.Types.ObjectId;
  Nama_Platform: string;
  Tujuan_Meminjam: string;
  Jumlah_Pinjaman: number;
  Pemasukan_PerBulan: number;
  Pengeluaran_PerBulan: number;
  Nominal_Pinjaman_Saat_Ini: number;
//   hasilAsesmen?: string;
//   levelKelayakan?: "Layak" | "Perlu Pertimbangan" | "Tidak Disarankan";
}

const BeforeYouBorrowSchema = new mongoose.Schema<IBeforeYouBorrow>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Nama_Platform: {
      type: String,
      required: true,
    },
    Tujuan_Meminjam: {
      type: String,
      enum: [
        "Kebutuhan Mendesak",
        "Modal Usaha",
        "Pendidikan",
        "Kesehatan",
        "Konsumtif",
        "Renovasi/Properti",
        "Kendaraan",
        "Lainnya",
      ],
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
    // ===== HASIL ASESMEN AI (opsional dulu, menyusul) =====
    // hasilAsesmen: {
    //   type: String,
    //   required: false,
    // },
    // levelKelayakan: {
    //   type: String,
    //   enum: ["Layak", "Perlu Pertimbangan", "Tidak Disarankan"],
    //   required: false,
    // },
  },
  { timestamps: true }
);

const BeforeYouBorrowModel = mongoose.model<IBeforeYouBorrow>(
  "BeforeYouBorrow",
  BeforeYouBorrowSchema
);
export default BeforeYouBorrowModel;