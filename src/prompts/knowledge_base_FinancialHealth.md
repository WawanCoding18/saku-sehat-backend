=================== KNOWLEDGE BASE FINANCIAL HEALTH ===================

1. KONTRAK TIPE DATA STRUKTUR RESPON AI
AI WAJIB mengembalikan tipe data yang presisi sesuai dengan ketentuan berikut:
- skorTotal: number (0 - 100)
- grade: string (Pilihan enum: "A" | "B" | "C" | "D" | "E")
- SubScore Object (digunakan pada pilar disiplinAnggaran dan pengelolaanPinjaman):
  * skor: number (skor yang diperoleh pilar tersebut, maks 25)
  * maksimal: number (default: 25)
  * persentase: number (persentase capaian 0 - 100)
  * status: string (Pilihan enum WAJIB PERSIS: "Excellent" | "Good" | "Perlu Perhatian" | "Buruk")
  * ringkasan: string (narasi penjelasan singkat 1-2 kalimat)
  * saranPerkembangan: Array of string (array berisi 3 poin saran tindakan)

2. EVALUASI PILAR FINANCIAL HEALTH
Skor kesehatan finansial dinilai berdasarkan akumulasi data numerik pengguna:
- Disiplin Anggaran (disiplinAnggaran):
  * Kepatuhan pengeluaran terhadap batas anggaran kategori.
  * skor = (Kategori Budget Terpenuhi ÷ Total Kategori) × 25
  * persentase = (Kategori Budget Terpenuhi ÷ Total Kategori) × 100
  * status enum: 100% = "Excellent" | 75-99% = "Good" | 50-74% = "Perlu Perhatian" | <50% = "Buruk"
- Pengelolaan Pinjaman (pengelolaanPinjaman):
  * Rasio Debt-to-Income (DTI) = (Total Cicilan Bulanan ÷ Total Pemasukan) × 100%
  * skor = DTI ≤30% (25 pts) | 31-40% (17-24 pts) | 41-50% (10-16 pts) | >50% (<10 pts)
  * status enum: DTI ≤30% = "Excellent" | 31-40% = "Good" | 41-50% = "Perlu Perhatian" | >50% = "Buruk"
- Ketahanan Arus Kas (Diperhitungkan ke skorTotal dari rasio akumulasi Pemasukan, Pengeluaran, dan Saldo Saat Ini):
  * Mengevaluasi kecukupan saldo dan selisih positif antara rata-rata pemasukan terhadap rata-rata pengeluaran bulanan.

3. KONVERSI GRADE FINANCIAL HEALTH (skorTotal = total dari akumulasi pilar & rasio arus kas)
- skorTotal ≥85 : grade = "A" (Sangat Baik / Keuangan Sangat Sehat)
- skorTotal ≥70 : grade = "B" (Baik / Keuangan Hampir Sehat)
- skorTotal ≥55 : grade = "C" (Cukup / Keuangan Cukup Stabil)
- skorTotal ≥40 : grade = "D" (Kurang / Keuangan Perlu Perbaikan)
- skorTotal <40  : grade = "E" (Buruk / Keuangan Berisiko Tinggi)

4. GUIDELINE PENULISAN TEKS AI (ringkasan & saranPerkembangan)
- Evaluasi secara rasional kondisi akumulasi rata-rata total pemasukan, pengeluaran, dan saldo saat ini untuk menyusun narasi ringkasan.
- ringkasan: string berisi 1-2 kalimat deskripsi ringkas kondisi pilar. Gunakan **bold** pada angka/rasio/kata kunci penting.
- saranPerkembangan: Array of string (string[]) yang berisi TEPAT 3 poin saran taktis yang dapat dilakukan pengguna.
=======================================================================