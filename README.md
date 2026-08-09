# Saku Sehat Backend

## Deskripsi

Saku Sehat Backend adalah backend API untuk aplikasi finansial yang membantu pengguna mengelola keuangan pribadi secara lebih terarah dan aman. Project ini mendukung alur autentikasi pengguna, pencatatan transaksi, pengelolaan pinjaman, target tabungan, budgeting, analisis kondisi finansial, serta rekomendasi berbasis AI.

Backend ini dibangun dengan Node.js, TypeScript, dan Express.js, lalu terhubung ke MongoDB sebagai database utama. Project ini juga menyediakan dokumentasi API otomatis melalui Swagger serta integrasi OCR dan AI untuk mempercepat analisis transaksi.

## Key Features

- Autentikasi pengguna dengan JWT untuk register, login, logout, verifikasi OTP, dan resend OTP.
- Pengelolaan profil pengguna melalui onboarding dan update data profil.
- CRUD transaksi keuangan untuk mencatat pemasukan dan pengeluaran.
- OCR berbasis upload gambar untuk membaca data dari struk transaksi.
- Fitur pinjaman lengkap: tambah, edit, bayar, dan hapus pinjaman.
- Kalkulator bunga cicilan untuk simulasi pinjaman.
- Fitur budgeting untuk mengatur batas pengeluaran per kategori.
- Analisis Before You Borrow untuk menilai kelayakan pinjaman sebelum mengambil keputusan.
- Fitur Cari Aman untuk membantu mendeteksi potensi risiko atau penipuan.
- Dashboard finansial health untuk melihat gambaran kondisi keuangan pengguna.
- Dokumentasi API terintegrasi dengan Swagger UI.

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

Response berhasil:

```json
{
  "message": "Registration successful",
  "data": {
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "role": "user",
    "isActive": false
  }
}
```

Validasi:

- fullName wajib diisi.
- username wajib diisi.
- email harus menggunakan format email yang valid.
- password minimal 6 karakter dan harus mengandung huruf besar serta angka.
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

Response berhasil:

```json
{
  "message": "Login successful",
  "data": "<jwt-token>"
}
```

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

Response berhasil:

```json
{
  "message": "Transaksi berhasil dibuat",
  "data": {
    "_id": "64f...",
    "tipe": "pengeluaran",
    "kategori": "Makanan",
    "nominal": 50000
  }
}
```

Validasi:

- tipe harus bernilai pengeluaran atau pemasukan.
- nominal wajib berupa angka.
- tanggal bersifat opsional, jika tidak dikirim maka akan memakai tanggal saat ini.

### 4. OCR Upload

Endpoint:

```http
POST /api/catatan-keuangan/scan
```

Header:

```http
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>
```

Form-data:

- image: file gambar struk transaksi

Response yang dikembalikan biasanya berisi hasil ekstraksi teks dan data transaksi yang terdeteksi dari gambar.

### 5. API Documentation

Swagger UI tersedia di:

```text
GET /api-docs
```

## Project Structure

Struktur folder utama project ini adalah sebagai berikut:

```text
src/
  controllers/        # Handler logic untuk setiap endpoint API
  middlewares/        # Middleware seperti autentikasi dan upload file
  models/             # Schema dan model MongoDB
  routes/             # Routing API utama
  services/           # Integrasi AI, OCR, dan layanan eksternal
  utils/              # Helper seperti database, env, JWT, mail, dan enkripsi
  docs/               # Konfigurasi Swagger dan dokumentasi API
  prompts/            # Prompt AI dan knowledge base
  index.ts            # Entry point aplikasi
```

Penjelasan folder penting:

- src/index.ts: entry point server Express dan konfigurasi CORS.
- src/routes/api.ts: registrasi semua route API utama.
- src/controllers: implementasi logic bisnis untuk auth, profile, transaksi, pinjaman, budgeting, dan analisis finansial.
- src/models: definisi model data untuk user, transaksi, profil, pinjaman, target tabungan, dan fitur lainnya.
- src/services: integrasi AI, OCR, dan layanan pihak ketiga.
- src/utils: utilitas seperti koneksi database, env, JWT, email, dan enkripsi.
- src/docs: konfigurasi Swagger UI dan output dokumentasi API.

## Tech Stack

Teknologi yang digunakan pada project ini antara lain:

- Node.js 22.x
- TypeScript
- Express.js
- MongoDB dengan Mongoose
- JSON Web Token (JWT)
- Swagger UI + Swagger Autogen
- Multer untuk upload file
- Tesseract.js untuk OCR
- Gemini AI dan Groq untuk fitur analisis berbasis AI
- Nodemailer untuk pengiriman email OTP
- dotenv, cors, yup, dan zod untuk konfigurasi dan validasi

## Local Setup

### Prerequisites

Sebelum menjalankan project ini secara lokal, pastikan perangkat Anda sudah menyiapkan:

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
