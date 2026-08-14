# Saku Sehat Backend

## Deskripsi

Saku Sehat Backend adalah backend API untuk aplikasi finansial yang membantu pengguna mengelola keuangan secara lebih terstruktur, aman, dan mudah dipahami. Project ini dirancang untuk mendukung kebutuhan utama seperti autentikasi pengguna, pencatatan transaksi, pengelolaan pinjaman, target tabungan, budgeting, analisis kesehatan finansial, serta rekomendasi keputusan finansial berbasis AI.

Backend ini dibangun dengan Node.js, TypeScript, dan Express.js, serta menggunakan MongoDB sebagai database utama. Project ini juga menyediakan dokumentasi API otomatis melalui Swagger, integrasi OCR untuk membaca struk transaksi, dan koneksi ke layanan AI seperti Gemini dan Groq untuk menganalisis kondisi keuangan dan kelayakan pinjaman.

Project ini berperan sebagai layer backend utama untuk aplikasi Saku Sehat, yang mendukung pengalaman pengguna dalam mengelola pendapatan, pengeluaran, target menabung, pinjaman, dan evaluasi kesehatan finansial secara digital.

## Key Features

- Autentikasi lengkap pengguna dengan JWT untuk register, login, logout, verify OTP, dan resend OTP.
- Pengelolaan profil pengguna melalui onboarding, melihat data profil, dan update profil.
- CRUD transaksi keuangan untuk mencatat pemasukan dan pengeluaran.
- OCR pada gambar struk atau catatan transaksi dengan bantuan PaddleOCR.
- Manajemen pinjaman mulai dari tambah, lihat, bayar, edit, hingga hapus pinjaman.
- Fitur target tabungan untuk mengelola rencana menabung berdasarkan target tertentu.
- Fitur budgeting untuk membatasi alokasi pengeluaran berdasarkan kategori kebutuhan.
- Kalkulator bunga dan simulasi pinjaman untuk analisis keputusan finansial.
- Fitur before you borrow untuk menilai apakah kebutuhan pinjaman masuk akal sebelum mengambil keputusan.
- Fitur cari aman untuk mengevaluasi risiko finansial dan keamanan keputusan investasi atau pinjaman.
- Analisis financial health untuk melihat kondisi kesehatan keuangan pengguna secara komprehensif.
- Dashboard finansial berisi ringkasan data keuangan pengguna.
- Dokumentasi API otomatis melalui Swagger UI.
- Integrasi AI untuk memberikan insight dan rekomendasi finansial berdasarkan konteks pengguna.
- Middleware autentikasi dan upload file untuk menjaga keamanan dan kelancaran proses data.

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
- email harus format email yang valid.
- password minimal 6 karakter.
- password harus memiliki minimal 1 huruf kapital dan 1 angka.
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
- JWT token akan dikirim jika kredensial valid.

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
- nominal wajib diisi dan harus berupa angka.
- tanggal bersifat opsional; jika tidak dikirim, sistem otomatis memakai tanggal saat ini.

### 4. OCR Upload untuk Struk

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
- format file harus sesuai dengan upload middleware.
- user harus terautentikasi melalui JWT.

### 5. PaddleOCR Integration (Modal.com)

OCR pada project ini dipanggil dari layanan PaddleOCR yang di-deploy di Modal.com. Implementasi lengkapnya ada di [src/services/ocr.services.ts](src/services/ocr.services.ts).

#### Endpoint

```http
POST https://wawancoding18--paddleocr-fastapi-service-fastapi-app.modal.run/ocr
```

Atau melalui environment variable:

```env
MODAL_OCR_URL=https://wawancoding18--paddleocr-fastapi-service-fastapi-app.modal.run/ocr
```

#### Cara pemanggilan dari backend

Kode backend melakukan proses berikut:

1. menerima file image dari request upload
2. resize menggunakan `sharp`
3. konversi ke `image/jpeg`
4. kirim via `multipart/form-data` dengan field `file`
5. menunggu response JSON dari service OCR

Contoh implementasi:

```ts
const formData = new FormData();
formData.append("file", resizedBuffer, {
  filename: originalName.replace(/\.[^/.]+$/, "") + ".jpg",
  contentType: "image/jpeg",
});

const response = await axios.post<PaddleOCRResponse>(PADDLE_OCR_URL, formData, {
  headers: {
    ...formData.getHeaders(),
  },
  timeout: 120000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});
```

#### Contoh request dengan curl

```bash
curl -X POST "https://wawancoding18--paddleocr-fastapi-service-fastapi-app.modal.run/ocr" \
  -F "file=@/path/to/receipt.jpg"
```

#### Contoh response

```json
{
  "result": [
    {
      "box": [
        [10, 20],
        [120, 20],
        [120, 40],
        [10, 40]
      ],
      "text": "Total",
      "confidence": 0.98
    },
    {
      "box": [
        [120, 20],
        [220, 20],
        [220, 40],
        [120, 40]
      ],
      "text": "50000",
      "confidence": 0.95
    }
  ],
  "processing_time_ms": 742.11
}
```

#### Struktur response yang digunakan backend

```ts
export interface OCRItem {
  box: number[][];
  text: string;
  confidence: number;
}

export interface PaddleOCRResponse {
  result: OCRItem[];
  processing_time_ms?: number;
}
```

#### Catatan teknis

- file dikirim dengan field name `file`
- backend otomatis resize image ke `1024x1024` dan konversi ke JPEG agar kompatibel untuk OCR
- request timeout diatur `120000` ms
- jika service gagal, backend akan melempar error: `Failed to process image with PaddleOCR microservice.`

### 6. Swagger Documentation

Endpoint:

```http
GET /api-docs
```

Swagger UI menampilkan endpoint API, parameter, request body, dan struktur response yang dapat dipelajari langsung dari browser.

## Project Structure

Struktur folder utama project ini adalah sebagai berikut:

```text
back-end-acara/
├─ .env                     # Konfigurasi environment variable
├─ package.json             # Informasi project dan dependency
├─ tsconfig.json            # Konfigurasi TypeScript
├─ vercel.json              # Konfigurasi deployment Vercel
├─ README.md                # Dokumentasi project
├─ LICENSE.md               # Lisensi project
├─ src/
│  ├─ index.ts              # Entry point server Express
│  ├─ controllers/          # Logika bisnis endpoint
│  ├─ middlewares/          # Middleware autentikasi, upload, dan keamanan
│  ├─ models/               # Schema dan model MongoDB
│  ├─ routes/               # Routing API backend
│  ├─ services/             # Integrasi AI, OCR, dan layanan eksternal
│  ├─ utils/                # Helper env, DB, JWT, mail, encryption, dsb
│  ├─ docs/                 # Konfigurasi Swagger dan output dokumentasi
│  ├─ prompts/              # Prompt dan knowledge base AI
│  └─ scripts/              # Script eksperimen / logic testing
├─ node_modules/            # Dependency hasil install
└─ .gitignore               # File yang diabaikan Git
```

Penjelasan folder penting:

- src/index.ts: file utama yang menjalankan server Express dan mengaktifkan middleware global seperti CORS dan JSON parser.
- src/routes/api.ts: berisi seluruh route API yang dikelompokkan berdasarkan fitur seperti auth, transaksi, pinjaman, budgeting, target tabungan, AI, dan dashboard.
- src/controllers: berisi logic bisnis dan handler response setiap endpoint.
- src/models: berisi definisi schema database MongoDB untuk user, transaksi, profil, pinjaman, target tabungan, budgeting, dan fitur lainnya.
- src/services: menyimpan integrasi AI (Gemini/Groq), OCR PaddleOCR, serta layanan eksternal lain.
- src/middlewares: memuat autentikasi, upload file, dan middleware keamanan.
- src/utils: berisi konfigurasi database, environment, JWT, email, encrypt/decrypt, serta helper pendukung.
- src/docs: berisi konfigurasi Swagger dan file hasil generate documentation.
- src/prompts: berisi prompt dan knowledge base untuk fitur Before You Borrow, Financial Health, dan Kalkulator Bunga.
- src/scripts: digunakan untuk eksperimen logika, pengujian, atau validasi fitur tertentu.

## Tech Stack

Teknologi utama yang digunakan pada project ini adalah:

- Node.js 22.x
- TypeScript
- Express.js
- MongoDB dengan Mongoose
- JWT (JSON Web Token)
- Swagger UI dan Swagger Autogen
- Multer untuk upload file
- PaddleOCR untuk proses OCR dari gambar struk
- Google Gemini AI dan Groq AI
- Nodemailer untuk pengiriman OTP dan email notifikasi
- Sharp untuk preprocess image sebelum OCR
- Axios dan FormData untuk komunikasi ke service OCR eksternal
- Yup dan Zod untuk validasi data

## Local Setup

### Prerequisites

Sebelum menjalankan project ini di local, siapkan hal berikut:

- Node.js versi 22.x
- npm atau pnpm
- Git
- Database MongoDB (baik local maupun MongoDB Atlas)
- Akun API Google Gemini
- Akun API Groq
- Email Gmail SMTP untuk OTP dan notifikasi email
- Service OCR PaddleOCR yang tersedia (bisa via endpoint Modal / service lain)

### 1. Clone Repository

```bash
git clone <repository-url>
cd back-end-acara
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root project dan isi dengan konfigurasi berikut:

```env
DATABASE_URL=mongodb://localhost:27017/saku-sehat
SECRET=your_jwt_secret_key
EMAIL_FROM=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
CLIENT_HOST=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
MODAL_OCR_URL=https://your-paddleocr-service-url/ocr
```

Penjelasan variabel:

- DATABASE_URL: koneksi MongoDB yang dipakai aplikasi.
- SECRET: secret key untuk JWT.
- EMAIL_FROM: alamat email pengirim untuk OTP dan notifikasi.
- EMAIL_APP_PASSWORD: password aplikasi Gmail (bukan password akun utama).
- CLIENT_HOST: host frontend yang akan menerima redirect/auth flow.
- GEMINI_API_KEY: API key model Gemini.
- GROQ_API_KEY: API key model Groq.
- MODAL_OCR_URL: endpoint PaddleOCR service untuk proses OCR gambar.

### 4. Generate Swagger Docs (opsional)

Jika ingin memperbarui file dokumentasi Swagger:

```bash
npm run docs
```

### 5. Run Project Locally

Mode development:

```bash
npm run dev
```

Server akan berjalan pada port default:

```text
http://localhost:4000
```

Untuk build production:

```bash
npm run build
npm run start
```

### 6. Cek Health Endpoint

Buka URL berikut di browser atau Postman:

```http
GET http://localhost:4000/
```

Contoh response:

```json
{
  "message": "Server running",
  "data": null
}
```

## Documentation

Berikut dokumentasi resmi dari teknologi yang dipakai di project ini:

- Node.js: https://nodejs.org/docs/
- TypeScript: https://www.typescriptlang.org/docs/
- Express.js: https://expressjs.com/
- MongoDB: https://www.mongodb.com/docs/
- Mongoose: https://mongoosejs.com/docs/
- Swagger: https://swagger.io/docs/
- Multer: https://github.com/expressjs/multer
- JWT: https://jwt.io/introduction
- Google Gemini API: https://ai.google.dev/gemini-api/docs
- Groq: https://console.groq.com/docs
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Modal.com: https://modal.com/docs
- Sharp: https://sharp.pixelplumbing.com/

## Commit Format Standards

Repo ini mengikuti standar Conventional Commits untuk menjaga konsistensi commit message.

Format umum:

```bash
<type>(<scope>): <subject>
```

Contoh type yang umum digunakan:

- feat: menambahkan fitur baru
- fix: memperbaiki bug
- docs: update dokumentasi
- chore: pekerjaan maintenance / setup / dependencies
- refactor: refactor kode tanpa mengubah behavior
- perf: optimasi performa
- test: menambahkan atau memperbaiki test

Contoh commit message:

```bash
feat(auth): add OTP verification flow
fix(ocr): improve PaddleOCR integration flow
docs(readme): update project setup and API overview
chore: update dependencies for Node 22 support
refactor(routes): simplify transaction endpoint grouping
```

Aturan penting:

- Subject harus singkat, jelas, dan menggambarkan perubahan utama.
- Gunakan bahasa Inggris untuk konsistensi commit message.
- Hindari commit message yang terlalu umum seperti "update" atau "fix bug" tanpa konteks.
