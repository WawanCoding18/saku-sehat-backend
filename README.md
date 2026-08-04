# Backend Saku Sehat

## Deskripsi

Saku Sehat adalah backend project financial health monitoring yang dirancang untuk membantu mahasiswa dan pengguna umum mengelola keuangan pribadi, memantau transaksi, menilai risiko pinjaman online, dan meningkatkan literasi finansial.

Aplikasi ini menggunakan:

- Express.js dan TypeScript sebagai fondasi server,
- MongoDB/Mongoose untuk penyimpanan data,
- JWT untuk autentikasi,
- Swagger untuk dokumentasi API,
- Tesseract.js dan layanan OCR untuk ekstraksi data struk,
- Integrasi AI (Gemini & Groq) untuk fitur analisis dan pemberian rekomendasi.

Backend ini menyediakan endpoint untuk autentikasi, profil pengguna, catatan transaksi, pinjaman, kalkulator bunga, budgeting, penilaian "Before You Borrow", deteksi risiko, dan dashboard financial health.

## Fitur yang Sudah Jadi

- Autentikasi pengguna dengan JWT
- Register, login, dan verifikasi OTP
- Onboarding profil pengguna dan pembaruan profil
- CRUD transaksi keuangan per pengguna
- Upload dan pemrosesan OCR struk transaksi
- Manajemen pinjaman online dengan pembayaran dan pengeditan
- Kalkulator bunga cicilan untuk membantu perhitungan pinjaman
- Budgeting dan pencatatan anggaran keuangan
- Fitur "Before You Borrow" untuk menilai kelayakan pinjaman
- Fitur "Cari Aman" untuk membantu deteksi risiko pinjaman/penipuan
- Dashboard financial health yang mengumpulkan metrik keuangan pengguna
- Swagger UI API documentation di `/api-docs`

## Preview

Berikut beberapa endpoint utama dengan contoh request, response, dan validasi.

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
- `email` harus format email valid
- `password` minimal 6 karakter
- `password` harus mengandung huruf besar dan angka
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

- `tipe` diharapkan `pengeluaran` atau `pemasukan`
- `nominal` wajib angka
- `tanggal` default ke tanggal saat ini jika tidak dikirim

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

Conten form-data:

- `image`: file gambar struk transaksi

Response berhasil biasanya berisi hasil ekstraksi teks dan data transaksi yang diambil dari gambar.

### 6. Dokumentasi API

Akses dokumentasi Swagger di:

```text
GET /api-docs
```

## Project Structure

```
src/
  index.ts              # Entry point Express server
  routes/api.ts         # Semua route utama API
  controllers/          # Logika bisnis per endpoint
  middlewares/          # Middleware autentikasi, upload, validasi
  models/               # Skema Mongoose untuk MongoDB
  services/             # Layanan AI, OCR, dan integrasi eksternal
  utils/                # Utilitas database, env, jwt, konfigurasi
  docs/                 # Swagger docs dan route dokumentasi
  prompts/              # Prompt AI dan knowledge base
```

Folder penting:

- `src/index.ts`: konfigurasi server, CORS, route, dan Swagger
- `src/routes/api.ts`: rute API inti termasuk auth, profile, transaksi, pinjaman, budgeting, kalkulator, dan dashboard
- `src/controllers/`: implementasi endpoint dan logika request/response
- `src/models/`: definisi data MongoDB untuk user, transaksi, profil, pinjaman, dan fitur lainnya
- `src/utils/env.ts`: pemuatan variabel environment
- `src/docs/route.ts`: konfigurasi Swagger UI untuk dokumentasi API

## Tech Stack

- Node.js 22.x
- TypeScript
- Express.js
- MongoDB dengan Mongoose
- JSON Web Token (JWT)
- Swagger / swagger-ui-express
- Tesseract.js untuk OCR
- @google/genai dan Groq GPT untuk fitur AI
- multer untuk upload file
- dotenv untuk environment variables
- cors untuk integrasi frontend

## Local Setup

### Prasyarat

- Node.js 22.x
- npm atau yarn
- MongoDB lokal atau MongoDB Atlas
- Git (opsional untuk clone repository)

### Langkah Setup

1. Clone repository:

```bash
git clone <repo-url>
cd back-end-acara
```

2. Install dependencies:

```bash
npm install
```

3. Buat file `.env` di root project dan isi variabel berikut:

```env
DATABASE_URL=mongodb://localhost:27017/back-end-acara
SECRET=your_jwt_secret
EMAIL_FROM=youremail@example.com
EMAIL_APP_PASSWORD=your-email-app-password
CLIENT_HOST=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
MODAL_OCR_URL=https://your-ocr-service-url
```

4. Jalankan server development:

```bash
npm run dev
```

5. Buka browser di:

```text
http://localhost:4000
```

6. Akses dokumentasi API di:

```text
http://localhost:4000/api-docs
```

Jika ingin menjalankan versi produksi:

```bash
npm run build
npm start
```

## Documentation

- Express.js: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/
- MongoDB: https://www.mongodb.com/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/
- Swagger UI Express: https://www.npmjs.com/package/swagger-ui-express
- Tesseract.js: https://tesseract.projectnaptha.com/
- dotenv: https://www.npmjs.com/package/dotenv

## Commit Format Standards

Gunakan format commit message yang jelas agar riwayat perubahan mudah dibaca. Contoh standar yang direkomendasikan:

- `feat(scope): tambah fitur baru`
- `fix(scope): perbaiki bug`
- `docs(scope): perbarui dokumentasi`
- `chore(scope): tugas rutin atau konfigurasi`
- `refactor(scope): perbaikan kode tanpa menambah fitur`

Contoh commit message:

- `feat(auth): tambahkan endpoint register dan login`
- `fix(transactions): perbaiki validasi nominal transaksi`
- `docs(readme): perbarui panduan setup lokal`
- `chore(deps): update dependency npm`

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
