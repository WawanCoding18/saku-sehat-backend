# Backend Saku Sehat

## Deskripsi

Saku Sehat adalah platform financial health monitoring berbasis website yang membantu mahasiswa mengelola keuangan, memahami risiko pinjaman online/paylater, dan meningkatkan literasi keuangan. Project ini mengintegrasikan LLM (Gemini 3.1 Flash Lite & Groq GPT-OSS 20B) dan OCR (Tesseract.js) untuk mendukung fitur pencatatan transaksi (manual & scan struk), kalkulator transparansi bunga, penilaian rencana peminjaman (Before You Borrow), serta deteksi pinjol/penipuan dari teks SMS/WhatsApp (Pinjol Detector).

Backend dibangun menggunakan Express.js dan TypeScript dengan MongoDB sebagai basis data, dilengkapi autentikasi JWT dan mekanisme round-robin fallback antar penyedia AI untuk menjaga keandalan sistem saat salah satu API mengalami gangguan.

Project ini dirancang untuk memudahkan integrasi dengan frontend dan menyediakan dokumentasi API yang mudah diakses melalui Swagger.


## Fitur yang Baru Jadi

- Autentikasi pengguna dengan JWT
- Register dan login pengguna dengan validasi input
- Pengelolaan profil pengguna dan onboarding profile
- CRUD transaksi keuangan per user yang sedang login
- Fitur OCR untuk memindai gambar transaksi dan mengekstrak data dengan bantuan AI
- Fitur mengisi dan mengedit Profile user.
- Dokumentasi API otomatis menggunakan Swagger
- Koneksi ke MongoDB melalui Mongoose
- Dukungan CORS untuk integrasi frontend

## Preview

Berikut contoh beberapa endpoint yang tersedia di backend ini.

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

- `fullName` wajib diisi
- `username` wajib diisi
- `email` harus format email yang valid
- `password` minimal 6 karakter
- `password` harus mengandung minimal 1 huruf besar dan 1 angka
- `confirmPassword` harus sama dengan `password`

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
### 3. Create Profile

Endpoint:

```http
POST /api/profile/onboarding
```

Header:

```http
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "fotoProfilUrl": "https://example.com/uploads/profile.jpg",
  "saldoSekarang": 500000,
  "sumberPemasukan": "Freelance",
  "onboardingCompleted": true
}
```

Response berhasil:

```json
{
  "message": "Profile berhasil dibuat",
  "data": {
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "fotoProfilUrl": "https://example.com/uploads/profile.jpg",
    "saldoSekarang": 500000,
    "sumberPemasukan": "Freelance"
  }
}
```


### 4. Create Transaction

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
  "tanggal": "2026-07-27"
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

- `tipe` biasanya berupa `pengeluaran` atau `pemasukan`
- `nominal` wajib berupa angka
- `tanggal` jika tidak dikirim akan otomatis menggunakan tanggal saat ini

### 5. OCR Scan Transaction

Endpoint:

```http
POST /api/catatan-keuangan/scan
```

Header:

```http
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>
```

Request body:

- field `image` berisi file gambar bukti transaksi

Response berhasil:

```json
{
  "type": "done",
  "result": {
    "tipe": "pengeluaran",
    "kategori": "Makanan",
    "nominal": 50000
  },
  "data": {
    "_id": "64f..."
  }
}
```

## Project Structure

Struktur folder utama project adalah sebagai berikut:

```text
src/
  controllers/        # Logic handler untuk endpoint API
  middlewares/        # Middleware seperti autentikasi JWT dan upload file
  models/             # Schema dan model MongoDB
  routes/             # Routing API
  services/           # Integrasi AI, OCR, dan layanan bisnis
  utils/              # Helper seperti database, JWT, env, email, enkripsi
  docs/               # Konfigurasi Swagger dan dokumentasi API
  index.ts            # Entry point aplikasi
```

Penjelasan folder penting:

- `src/controllers` : berisi controller untuk auth, profile, transaksi, dan OCR
- `src/middlewares` : berisi middleware autentikasi dan upload file
- `src/models` : berisi model pengguna, profil, dan transaksi
- `src/routes` : mengatur endpoint API
- `src/services` : berisi integrasi AI dan OCR untuk ekstraksi data transaksi
- `src/utils` : berisi utilitas seperti koneksi database, JWT, env, dan email
- `src/docs` : berisi konfigurasi Swagger dan output dokumentasi API

## Tech Stack

Teknologi yang digunakan pada project ini antara lain:

- Node.js
- Express.js
- TypeScript
- MongoDB dengan Mongoose
- JWT untuk autentikasi
- Nodemailer untuk pengiriman email OTP
- Swagger UI + Swagger Autogen untuk dokumentasi API
- Yup untuk validasi input
- Tesseract.js untuk OCR
- Gemini / Groq untuk pemrosesan AI

## Local Setup

### Prerequisites

Sebelum menjalankan project ini di local, pastikan perangkat sudah menyiapkan:

- Node.js versi 22.x
- npm atau yarn
- MongoDB local atau akun MongoDB Atlas
- Akun email SMTP untuk mengirim OTP
- API key dari Gemini dan Groq untuk fitur AI

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

3. Buat file environment

Buat file `.env` di root project dengan isi berikut:

```env
DATABASE_URL=mongodb://localhost:27017/acara-db
SECRET=your_jwt_secret
EMAIL_FROM=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
CLIENT_HOST=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

Keterangan:

- `DATABASE_URL` adalah URL koneksi MongoDB
- `SECRET` digunakan untuk menandatangani JWT
- `EMAIL_FROM` dan `EMAIL_APP_PASSWORD` digunakan untuk SMTP email OTP
- `CLIENT_HOST` digunakan untuk redirect atau link frontend jika dibutuhkan
- `GEMINI_API_KEY` dan `GROQ_API_KEY` diperlukan untuk fitur AI/OCR

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

Berikut dokumentasi resmi dari teknologi yang digunakan:

- Express.js: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/
- Swagger: https://swagger.io/
- Nodemailer: https://nodemailer.com/
- Tesseract.js: https://tesseract.projectnaptha.com/
- Gemini AI: https://ai.google.dev/
- Groq: https://console.groq.com/docs

## Commit Format Standards

Repository ini disarankan menggunakan standar Conventional Commits agar history commit lebih rapi dan mudah dipahami.

Format commit:

```text
type(scope): subject
```

Contoh type yang umum digunakan:

- `feat` : menambahkan fitur baru
- `fix` : memperbaiki bug
- `docs` : perubahan dokumentasi
- `refactor` : perbaikan struktur kode tanpa mengubah behavior
- `chore` : tugas pemeliharaan seperti update dependency

Contoh commit message:

```text
feat(auth): add OTP verification endpoint
```

Contoh lain:

```text
fix(user): resolve login validation issue
```

```text
docs(readme): update project setup instructions
```
