// // src/models/pinjaman.model.ts
// import mongoose, { Schema, Document } from "mongoose";

// export interface IPinjaman {
//   user: mongoose.Types.ObjectId;
//   namaPlatform: string;
//   jenisPinjaman: string;
//   pinjamanAwal: number;
//   tenorCicilan: number;
//   persenBunga: number;
//   cicilanBulanan: number;
//   sisaTagihan: number;
//   jatuhTempo: Date;
//   statusPinjaman: "Aktif" | "Lunas" | "Menunggak";
// }

// const PinjamanSchema = new Schema<IPinjaman>(
//   {
//     user: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     namaPlatform: { type: String, required: true },
//     jenisPinjaman: {
//       type: String,
//       enum: [
//         "KTA (Kredit Tanpa Agunan)",
//         "Paylater",
//         "Kredit Kendaraan",
//         "Kredit Rumah (KPR)",
//         "Pinjaman Online",
//         "Kartu Kredit",
//         "Lainnya",
//       ],
//       required: true,
//     },
//     pinjamanAwal: { type: Number, required: true, min: 0 },
//     tenorCicilan: { type: Number, required: true, min: 1 }, // dalam bulan
//     persenBunga: { type: Number, required: true, min: 0, default: 0 },
//     cicilanBulanan: { type: Number, required: true, min: 0 }, // hasil hitungan, bukan input manual
//     sisaTagihan: { type: Number, required: true, min: 0 }, // berubah tiap bayar cicilan
//     jatuhTempo: { type: Date, required: true },
//     statusPinjaman: {
//       type: String,
//       enum: ["Aktif", "Lunas", "Menunggak"],
//       default: "Aktif",
//     },
//   },
//   { timestamps: true }
// );

// const PinjamanModel = mongoose.model<IPinjaman>("kelolapinjaman", PinjamanSchema);
// export default PinjamanModel;



import mongoose, { Schema, Document } from "mongoose";

export interface IPinjaman {
  user: mongoose.Types.ObjectId;
  namaPlatform: string;
  jenisPinjaman: string;
  totalPinjaman: number;
  tenorCicilan: number;
  cicilanBulanan: number;
  totalYangHarusDibayar: number;
  jatuhTempo: Date;
  statusPinjaman: "Aktif" | "Lunas" | "Menunggak";
  persenBunga?: number;
}

const PinjamanSchema = new Schema<IPinjaman>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    namaPlatform: { type: String, required: true },
    jenisPinjaman: {
      type: String,
      enum: [
        "KTA (Kredit Tanpa Agunan)",
        "Paylater",
        "Kredit Kendaraan",
        "Kredit Rumah (KPR)",
        "Pinjaman Online",
        "Kartu Kredit",
        "Lainnya",
      ],
      required: true,
    },
    totalPinjaman: { type: Number, required: true, min: 0 },
    tenorCicilan: { type: Number, required: true, min: 1 },
    cicilanBulanan: { type: Number, required: true, min: 0 },
    totalYangHarusDibayar: { type: Number, required: true, min: 0 },
    jatuhTempo: { type: Date, required: true },
    statusPinjaman: {
      type: String,
      enum: ["Aktif", "Lunas", "Menunggak"],
      default: "Aktif",
    },
    persenBunga: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PinjamanModel = mongoose.model<IPinjaman>("kelolapinjaman", PinjamanSchema);
export default PinjamanModel;