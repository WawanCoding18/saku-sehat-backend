
### 1. DATA INPUT SIMULASI BEFORE YOU BORROW:
- "Nama_Platform": Nama platform yang dipakai buat pinjol /paylater legal (string).
- "Tujuan_Meminjam": Tujuan minjam mau untuk apa (string).
- "Jumlah_Pinjaman": Mau minjem duit berapa(number).
- "Pemasukan_Perbulan": Kira-kira rata2 total pemasukan perbulannya berapa(number).
- "Pengeluaran_Perbulan": Kira-kira rata2 total pengeluaran perbulannya berapa(number).
- "Nominal_Pinjaman_Saat_Ini": Nominal pinjaman yang harus dibayar saat ini(number)

### 2. MATRIKS DETERMINASI LEVEL KELAYAKAN:
A. Kategori "Layak" (Kondisi Keuangan Sangat Aman)
- Saldo Sekarang: Lebih besar dari 100% (minimal 2x lipat) dari total pengeluaran bulanan.
- Pemasukan Bulanan: Lebih besar minimal 50% dari total pengeluaran bulanan.
- Total Jumlah Pinjaman Aktif: Kurang dari atau sama dengan 30% dari total saldo sekarang.
- Nominal Angsuran/Pinjaman Baru yang Harus Dibayar: Kurang dari 30% dari total gabungan (pemasukan bulanan + saldo).

B. Kategori "Perlu Pertimbangan" (Kondisi Keuangan Waspada / Sedang)
- Saldo Sekarang: Berada di rentang 50% hingga 100% dari total pengeluaran bulanan.
- Pemasukan Bulanan: Setara atau lebih besar hingga 50% dari total pengeluaran bulanan.
- Total Jumlah Pinjaman Aktif: Berada di rentang 30% hingga 50% dari total saldo sekarang.
- Nominal Angsuran/Pinjaman Baru yang Harus Dibayar: Berada di rentang 30% hingga 50% dari total gabungan (pemasukan bulanan + saldo).

C. Kategori "Tidak Disarankan" (Kondisi Keuangan Berisiko Tinggi / Bahaya)
- Saldo Sekarang: Kurang dari 50% dari total pengeluaran bulanan (tidak ada dana darurat).
- Pemasukan Bulanan: Lebih kecil dari total pengeluaran bulanan (defisit).
- Total Jumlah Pinjaman Aktif: Lebih besar dari 50% dari total saldo sekarang.
- Nominal Angsuran/Pinjaman Baru yang Harus Dibayar: Lebih besar dari 50% dari total gabungan (pemasukan bulanan + saldo).


### 3. GUIDELINE NARRATIVE & SCORE, ALASAN PENILAIAN, REKOMENDASI, DAN SARAN ALTERNATIF AI (BEFORE YOU BORROW)

Aturan Struktur Output AI:
AI wajib mengembalikan respon dalam format JSON/Object dengan komponen:
- score (1-100) & riskLevel ("Risiko Rendah" / "Risiko Sedang" / "Risiko Tinggi")
- reasoning: Alasan penilaian berbasis kondisi saldo, pengeluaran, dan rasio cicilan.
- recommendation: Saran tindakan utama mengambil/menunda pinjaman.
- alternativeAction: Langkah taktis alternatif (kurangi nominal, perpanjang tenor, pakai tabungan).

Panduan Konten per Status:

1. Layak (Score 75-100 / Risiko Rendah):
- reasoning: Saldo dan pemasukan jauh di atas beban pengeluaran & cicilan baru.
- recommendation: Pinjaman aman diajukan. Jaga alokasi dana darurat dan total cicilan maks 30% dari pemasukan.
- alternativeAction: Bayar tepat waktu untuk terhindar denda dan pertahankan skor kredit baik.

2. Perlu Pertimbangan (Score 50-74 / Risiko Sedang):
- reasoning: Beban pengeluaran sudah cukup tinggi; tambahan cicilan berpotensi mengganggu kestabilan arus kas harian.
- recommendation: Ajukan hanya jika mendesak. Kurangi pengeluaran non-esensial sebelum menambah utang.
- alternativeAction: Kurangi nominal pinjaman, perpanjang tenor, atau gunakan tabungan jika memungkinkan.

3. Tidak Disarankan (Score 1-49 / Risiko Tinggi):
- reasoning: Saldo/pemasukan defisit atau berada di bawah ambang aman untuk membayar angsuran.
- recommendation: Hindari mengambil pinjaman baru karena berisiko tinggi memicu gagal bayar.
- alternativeAction: Tunda pengajuan hingga kondisi keuangan membaik dan prioritaskan pelunasan utang yang ada.