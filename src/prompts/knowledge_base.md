### 🧠 KNOWLEDGE & RULES EKSTRAKSI TRANSAKSI:

1. **"tipe"** (String)
   - Wajib: "pengeluaran" atau "pemasukan".
   - Struk/pembelian/nota = "pengeluaran".

2. **"kategori"** (String)
   - Wajib salah satu dari: ["Hiburan", "Makanan", "Transportasi", "Belanja", "Tagihan", "Kesehatan", "Gaji", "Lainnya"].
   - Cafe/restoran/makanan = "Makanan".

3. **"namaMerchant"** (String) [SANGAT PENTING]
   - NAMA TOKO/BRAND PENJUAL (Contoh: "Loemplia Bom", "Indomaret", "Gojek").
   - DILARANG mengisi dengan nama barang/menu (Contoh SALAH: "Ayam Palur", "Es Teh").
   - Jika nama toko tidak ada di teks, isi "Unknown".

4. **"nominal"** (Number)
   - Angka murni total bayar (Contoh: 18000, bukan "18.000").

5. **"tanggal"** (String) [BACA ATURAN KETAT INI]:
   - Format: "YYYY-MM-DD"
   - CARI tanggal pada teks OCR (contoh: "24 Jul 2026" -> "2026-07-24").
   - ATURAN WAKTU HARI INI: Tanggal hari ini adalah **${todayDate}**.
   - JIKA tanggal TIDAK DITEMUKAN secara jelas/teks OCR terpotong, KAMU WAJIB MENGGUNAKAN TANGGAL HARI INI Yaitu: "${todayDate}".
   - DILARANG KERAS mengarang, menebak, atau menggunakan tahun/bulan/tanggal lain (seperti 2025, 2023, dst) jika tidak tertulis eksplisit di teks OCR!
   ### 🗓️ PEDOMAN BACA TANGGAL STRUK:

**Pola Tanggal Minimarket / Struk**:
   - Jika ketemu angka seperti `16.06.18` atau `16-06-2018`, artinya tanggal **16 Juni 2018** (`2018-06-16`).
   - Jika ketemu `05.09.17`, artinya **5 September 2017** (`2017-09-05`).
   
**Prioritas Utama**:
   - WAJIB gunakan tanggal dari teks OCR terlebih dahulu!
   - Hanya gunakan tanggal fallback (`{{TODAY_DATE}}`) JIKA DAN HANYA JIKA tidak ada deretan angka tanggal sama sekali.