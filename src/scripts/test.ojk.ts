import "dotenv/config";
import connectDB from "../utils/database";
import { OjkLegalListModel } from "../models/ojk.model";
import OJKData from "../knowledge/ojk-legal-list.json";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// const dataOjkLegalList = OJKData.map((item: any) => ({
//   ...item,
//   is_active: true,
// }));

async function askQuestion(): Promise<string> {
  return new Promise((resolve) => {
    rl.question(
      "Masukkan nama platform untuk pengujian (misal: 'Rupiah Cepat'): ",
      (answer) => resolve(answer.trim())
    );
  });
}

async function seed() {
  console.log("⏳ Menghubungkan ke MongoDB...");
  await connectDB();

  // Opsional: hapus data lama dulu kalau mau seed ulang bersih
  // console.log("🧹 Membersihkan data lama...");
  // await OjkLegalListModel.deleteMany({});

  // Opsional: masukkan data dari JSON
  // console.log("🚀 Memasukkan data baru...");
  // const insertedData = await OjkLegalListModel.insertMany(dataOjkLegalList);
  // console.log(`✅ BERHASIL: ${insertedData.length} data dimasukkan!`);

  const userMessage = await askQuestion();

  const totalActive = await OjkLegalListModel.countDocuments({
    is_active: true,
  });

  console.log(`📊 Total data aktif: ${totalActive} entitas.`);

  const samplePlatform = await OjkLegalListModel.findOne({
    platform_name: { $regex: userMessage, $options: "i" },
  });

  console.log("\n🔍 HASIL PENGUJIAN:");
  if (samplePlatform) {
    console.log("   └─ Status    : DITEMUKAN");
    console.log("   └─ Platform  : ", samplePlatform.platform_name);
    console.log("   └─ Izin OJK  : ", samplePlatform.license_number);
    console.log("   └─ Company   : ", samplePlatform.company_name);
    console.log("   └─ Website   : ", samplePlatform.website_url);
  } else {
    console.log("   └─ Status    : TIDAK DITEMUKAN / TIDAK TERDAFTAR");
  }

  rl.close();
  console.log("\n🎉 Seluruh proses pengujian selesai!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Terjadi kesalahan saat proses:", err);
  rl.close();
  process.exit(1);
});

export { seed };