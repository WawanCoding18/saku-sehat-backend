# Saku Sehat Backend

## Deskripsi

Saku Sehat Backend adalah backend API untuk aplikasi finansial yang membantu pengguna mengelola keuangan pribadi dengan lebih terstruktur, aman, dan mudah dipahami. Project ini didesain untuk mendukung berbagai kebutuhan terkait pengelolaan keuangan seperti autentikasi pengguna, pencatatan transaksi, analisis pinjaman, pengaturan budgeting, hingga rekomendasi dan insight finansial berbasis AI.

Backend ini dibangun menggunakan Node.js, TypeScript, dan Express.js, serta terhubung ke MongoDB sebagai database utama. Project ini juga menyediakan dokumentasi API otomatis melalui Swagger, integrasi OCR untuk membaca struk transaksi, serta koneksi ke layanan AI seperti Gemini dan Groq untuk menganalisis kondisi keuangan dan kelayakan pinjaman.

Secara umum, project ini berfungsi sebagai layanan backend untuk aplikasi Saku Sehat yang mendukung pengalaman pengguna dalam mengelola pendapatan, pengeluaran, target tabungan, pengajuan pinjaman, dan evaluasi kesehatan finansial secara digital.

## Key Features

- Autentikasi pengguna lengkap dengan JWT untuk register, login, logout, verifikasi OTP, dan resend OTP.
- Pengelolaan profil pengguna melalui onboarding, melihat data profil, dan update profil.
- CRUD transaksi keuangan untuk mencatat pemasukan dan pengeluaran.
- OCR upload gambar untuk membaca data dari struk atau catatan transaksi menggunakan layanan OCR.
- Manajemen pinjaman dengan fitur tambah, lihat, bayar, edit, dan hapus pinjaman.
- Target tabungan untuk mengelola rencana menabung sesuai target tertentu.
- Fitur budgeting untuk membatasi pengeluaran berdasarkan kategori dan kebutuhan.
- Kalkulator bunga dan simulasi pinjaman untuk perencanaan keuangan.
- Fitur before you borrow untuk menilai ide atau kebutuhan pinjaman sebelum mengambil keputusan.
- Fitur cari aman untuk mengevaluasi kondisi dan risiko finansial secara lebih hati-hati.
- Analisis financial health untuk mendapatkan gambaran kondisi kesehatan keuangan pengguna.
- Dashboard finansial yang berisi ringkasan kondisi finansial pengguna.
- Dokumentasi API yang mudah diakses melalui Swagger UI.
- Integrasi AI serta OCR untuk memberikan insight yang lebih relevan kepada pengguna.

## Preview

Berikut beberapa contoh endpoint utama yang tersedia pada backend ini.

### 1. Register User

Endpoint:

```http
POST /api/auth/register
```

Request body:

```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

Contoh response:

```json
{
  "message": "Registration successful. Please check your email for OTP code.",
  "data": {
    "email": "johndoe@example.com"
  }
}
```

Validasi:

- fullName wajib diisi.
- username wajib diisi.
- email harus valid format email.
- password minimal 6 karakter.
- password harus mengandung minimal satu huruf kapital dan satu angka.
- confirmPassword harus sama dengan password.

### 2. Login User

Endpoint:

```http
POST /api/auth/login
```

Request body:

```json
{
  "identifier": "johndoe",
  "password": "Password123"
}
```

Contoh response:

```json
{
  "message": "Login successful",
  "data": "<jwt-token>"
}
```

Validasi:

- identifier dan password wajib diisi.
- token JWT akan dikirimkan jika kredensial valid.

### 3. Create Transaction

Endpoint:

```http
POST /api/catatan-keuangan/transaksi
```

Header:

```http
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "Catatan_Transaksi": "Belanja bulanan",
  "tipe": "pengeluaran",
  "kategori": "Makanan",
  "Sumber_Dana": "Gaji",
  "nominal": 50000,
  "tanggal": "2026-08-08"
}
```

Contoh response:

```json
{
  "message": "Transaksi berhasil dibuat",
  "data": {
    "_id": "64f...",
    "Catatan_Transaksi": "Belanja bulanan",
    "tipe": "pengeluaran",
    "kategori": "Makanan",
    "Sumber_Dana": "Gaji",
    "nominal": 50000
  }
}
```

Validasi:

- tipe harus bernilai pengeluaran atau pemasukan.
- nominal harus berupa angka dan wajib diisi.
- tanggal bersifat opsional; jika tidak dikirim, maka akan otomatis menggunakan tanggal saat ini.

### 4. Upload OCR untuk Struk

Endpoint:

```http
POST /api/catatan-keuangan/scan
```

Header:

```http
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

Form-data:

```text
image: <file-image>
```

Contoh response:

```json
{
  "message": "OCR processed successfully",
  "data": {
    "text": "...hasil ekstraksi teks dari gambar...",
    "transactions": [
      {
        "kategori": "Makanan",
        "nominal": 50000
      }
    ]
  }
}
```

Validasi:

- file gambar wajib dikirim.
- format file harus sesuai dengan file yang didukung oleh middleware upload.
- user harus terautentikasi melalui token JWT.

### 5. Dokumentasi API

Swagger UI tersedia pada endpoint berikut:

```http
GET /api-docs
```

Dokumentasi ini menampilkan semua endpoint yang tersedia beserta parameter, request body, dan response yang dipublikasikan oleh backend.

## Project Structure

Struktur folder utama project ini adalah sebagai berikut:

```text
back-end-acara/
├─ .env                     # Konfigurasi environment variable
├─ package.json             # Informasi project dan dependency
├─ tsconfig.json            # Konfigurasi TypeScript
├─ vercel.json              # Konfigurasi deployment Vercel
├─ README.md                # Dokumentasi project
├─ src/
│  ├─ index.ts              # Entry point server Express
│  ├─ controllers/          # Logika bisnis setiap endpoint
│  ├─ middlewares/          # Middleware autentikasi, upload, dll
│  ├─ models/               # Schema dan model MongoDB
│  ├─ routes/               # Routing API
│  ├─ services/             # Integrasi AI, OCR, dan layanan eksternal
│  ├─ utils/                # Helper database, env, encryption, JWT, dsb
│  ├─ docs/                 # Konfigurasi Swagger
│  ├─ prompts/              # Prompt dan knowledge base AI
│  └─ scripts/              # Script eksperimen / logic testing
├─ LICENSE.md               # Lisensi project
├─ eng.traineddata          # Data model Tesseract untuk bahasa Inggris
├─ ind.traineddata          # Data model Tesseract untuk bahasa Indonesia
└─ node_modules/            # Dependency hasil install
```

Penjelasan folder penting:

- src/index.ts: file utama yang menjalankan aplikasi Express dan mendefinisikan middleware global seperti CORS dan JSON parser.
- src/routes/api.ts: berisi seluruh route API yang dibagi ke fitur seperti auth, transaksi, pinjaman, budgeting, target tabungan, AI analysis, dan dashboard.
- src/controllers: berisi logic bisnis dan response handler dari setiap endpoint.
- src/models: tempat definisi schema MongoDB untuk user, transaksi, pinjaman, profil, budgeting, target tabungan, dan fitur lainnya.
- src/services: berisi integrasi layanan AI (Gemini/Groq), OCR, dan fungsi pendukung lainnya.
- src/middlewares: berisi autentikasi, upload file, serta middleware keamanan lain.
- src/utils: helper seperti database connection, env, JWT, mail, dan encryption.
- src/docs: berisi konfigurasi Swagger dan dokumentasi API.
- src/prompts: berisi prompt dan knowledge base AI untuk fitur Before You Borrow, Financial Health, dan Kalkulator Bunga.
- src/scripts: script untuk testing logika atau eksperimen pengembangan.

## Tech Stack

Teknologi utama yang digunakan pada project ini adalah:

- Node.js 22.x
- TypeScript
- Express.js
- MongoDB dengan Mongoose
- JWT (JSON Web Token)
- Swagger UI dan Swagger Autogen
- Multer untuk upload file
- Tesseract.js untuk OCR
- Google Gemini AI dan Groq AI
- Nodemailer untuk mengirim OTP/email notifikasi
- dotenv untuk lingkungan konfigurasi
- CORS untuk konfigurasi cross-origin
- Yup dan Zod untuk validasi data
- Axios untuk request HTTP ke service eksternal

## Local Setup

### Prerequisites

Sebelum menjalankan project ini di local, pastikan komputer atau environment Anda sudah memiliki beberapa hal berikut:

- Node.js versi 22.x atau yang kompatibel
- npm atau pnpm sebagai package manager
- MongoDB instance aktif, bisa lokal atau cloud (MongoDB Atlas)
- Akun email valid untuk fitur OTP, bila ingin menggunakan email notifikasi
- Kunci API dari layanan AI seperti Gemini API dan Groq API
- Git untuk proses clone repository

### 1. Clone Repository

```bash
git clone <repository-url>
cd back-end-acara
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file .env di root project dan isi variabel berikut:

```env
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-url>/db-saku-sehat
SECRET=<jwt-secret-key>
EMAIL_FROM=<alamat-email-pengirim>
EMAIL_APP_PASSWORD=<password-app-email>
GEMINI_API_KEY=<api-key-gemini>
GROQ_API_KEY=<api-key-groq>
MODAL_OCR_URL=<url-ocr-service>
CLIENT_HOST=http://localhost:3000
```

Catatan:

- DATABASE_URL adalah koneksi MongoDB utama yang dipakai project.
- SECRET digunakan untuk menandatangani JWT.
- EMAIL_FROM dan EMAIL_APP_PASSWORD digunakan untuk mengirim OTP atau email notifikasi.
- GEMINI_API_KEY dan GROQ_API_KEY dibutuhkan jika fitur AI aktif.
- MODAL_OCR_URL digunakan untuk proses OCR dari file gambar.

### 4. Generate Swagger Documentation (Opsional)

Jika ingin memperbarui dokumentasi Swagger secara manual:

```bash
npm run docs
```

### 5. Jalankan Server Local

Untuk menjalankan project di local:

```bash
npm run dev
```

Setelah server berjalan, aplikasi akan tersedia pada:

```text
http://localhost:4000
```

Swagger UI akan tersedia pada:

```text
http://localhost:4000/api-docs
```

### 6. Build Project untuk Production

```bash
npm run build
```

### 7. Jalankan Production Build

```bash
npm start
```

## Documentation

Berikut beberapa dokumentasi resmi yang relevan dengan stack yang digunakan:

- Node.js: https://nodejs.org/docs
- TypeScript: https://www.typescriptlang.org/docs/
- Express.js: https://expressjs.com/
- MongoDB: https://www.mongodb.com/docs/
- Mongoose: https://mongoosejs.com/docs/
- Swagger: https://swagger.io/docs/
- JWT: https://jwt.io/introduction
- Tesseract.js: https://tesseract.projectnaptha.com/
- Google Gemini API: https://ai.google.dev/gemini-api/docs
- Groq: https://console.groq.com/docs
- Nodemailer: https://nodemailer.com/usage/

## Commit Format Standards

Repository ini menggunakan standar commit message yang sederhana dan konsisten agar riwayat perubahan mudah dipahami. Format yang disarankan adalah:

```text
<type>(<scope>): <subject>
```

Keterangan:

- type: jenis perubahan, contoh: feat, fix, chore, docs, refactor, perf, test
- scope: area kerja yang terdampak, contoh: auth, transaksi, api, docs, db
- subject: deskripsi singkat perubahan dalam bentuk imperative sentence

Contoh commit message yang valid:

```bash
git commit -m "feat(auth): add user registration and OTP verification"
```

```bash
git commit -m "fix(transaksi): correct nominal validation on expense records"
```

```bash
git commit -m "docs(readme): update project documentation and setup guide"
```

```bash
git commit -m "refactor(api): simplify route grouping for financial features"
```

### Recommended Type List

- feat: menambahkan fitur baru
- fix: memperbaiki bug
- docs: perubahan dokumentasi
- chore: tugas maintenance non-fungsional
- refactor: perbaikan struktur kode tanpa mengubah perilaku
- perf: peningkatan performa
- test: menambahkan atau memperbaiki test

Dengan mengikuti format ini, commit history akan lebih rapi, mudah dibaca, dan lebih mudah dikelola saat kolaborasi tim.

---

Project ini dirancang sebagai backend layanan finansial yang membantu pengguna mengelola keuangan pribadi dengan lebih mudah, terstruktur, dan aman. Anda dapat memanfaatkan API ini untuk membangun aplikasi front-end, dashboard, atau produk finansial lainnya yang terhubung ke sistem backend yang sama.

- Node.js versi 22.x
- npm atau yarn
- MongoDB lokal atau akun MongoDB Atlas
- Akun email SMTP untuk fitur OTP
- API key Gemini dan Groq untuk fitur AI
- Git (opsional, untuk clone repository)

### Langkah-langkah Setup

1. Clone repository

```bash
git clone <repository-url>
cd back-end-acara
```

2. Install dependencies

```bash
npm install
```

3. Buat file .env di root project

```env
DATABASE_URL=mongodb://localhost:27017/back-end-acara
SECRET=your_jwt_secret
EMAIL_FROM=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
CLIENT_HOST=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
MODAL_OCR_URL=https://your-ocr-service-url
```

Keterangan variabel:

- DATABASE_URL: URL koneksi MongoDB.
- SECRET: kunci rahasia untuk JWT.
- EMAIL_FROM dan EMAIL_APP_PASSWORD: kredensial SMTP untuk OTP email.
- CLIENT_HOST: URL frontend yang akan digunakan untuk redirect tertentu.
- GEMINI_API_KEY dan GROQ_API_KEY: API key untuk fitur AI.
- MODAL_OCR_URL: URL layanan OCR opsional yang digunakan oleh service OCR.

4. Jalankan aplikasi dalam mode development

```bash
npm run dev
```

Server akan berjalan di:

```text
http://localhost:4000
```

5. Akses dokumentasi API

```text
http://localhost:4000/api-docs
```

### Build untuk production

```bash
npm run build
npm start
```

## Documentation

Dokumentasi resmi dari teknologi yang digunakan:

- Express.js: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/
- MongoDB: https://www.mongodb.com/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/
- Swagger: https://swagger.io/
- Nodemailer: https://nodemailer.com/
- Tesseract.js: https://tesseract.projectnaptha.com/
- Gemini AI: https://ai.google.dev/
- Groq: https://console.groq.com/docs

## Commit Format Standards

Repository ini disarankan menggunakan standar Conventional Commits agar riwayat perubahan lebih rapi dan mudah dipahami.

Format commit:

```text
type(scope): subject
```

Contoh type yang umum digunakan:

- feat: menambahkan fitur baru
- fix: memperbaiki bug
- docs: perubahan dokumentasi
- refactor: perbaikan struktur kode tanpa mengubah behavior
- chore: tugas pemeliharaan seperti update dependency

Contoh commit message:

```text
feat(auth): tambahkan endpoint register dan login
```

```text
fix(transactions): perbaiki validasi nominal transaksi
```

```text
docs(readme): perbarui panduan setup lokal
```
