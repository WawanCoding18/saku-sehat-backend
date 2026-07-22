# Backend Acara

## Deskripsi

Backend Acara adalah layanan backend berbasis Node.js dan Express untuk mendukung alur autentikasi pengguna pada aplikasi acara. Project ini menyediakan fitur register, login, pengambilan data profil pengguna, verifikasi OTP, serta pengiriman ulang OTP melalui email.

Aplikasi ini juga dilengkapi dengan dokumentasi API menggunakan Swagger sehingga memudahkan pengembangan dan integrasi dengan frontend.

## Key Features

- Autentikasi pengguna dengan JWT
- Register akun baru dengan validasi input
- Login menggunakan username/email dan password
- Mendapatkan data profil pengguna melalui token
- Verifikasi OTP dan resend OTP melalui email
- Dokumentasi API otomatis dengan Swagger
- Koneksi database MongoDB menggunakan Mongoose
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

### 3. Get Current User Profile

Endpoint:

```http
GET /api/auth/me
```

Header:

```http
Authorization: Bearer <jwt-token>
```

Response berhasil:

```json
{
  "message": "Success Get User Profile",
  "data": {
    "_id": "64f....",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "johndoe@example.com"
  }
}
```

### 4. Verify OTP

Endpoint:

```http
POST /api/auth/verify-otp
```

Request body:

```json
{
  "email": "johndoe@example.com",
  "otp": "123456"
}
```

### 5. Resend OTP

Endpoint:

```http
POST /api/auth/resend-otp
```

Request body:

```json
{
  "email": "johndoe@example.com"
}
```

## Project Structure

Berikut struktur folder utama project:

```text
src/
  controllers/        # Logic handler untuk endpoint
  middlewares/        # Middleware seperti autentikasi JWT
  models/             # Schema dan model MongoDB
  routes/             # Routing API
  utils/              # Helper seperti database, JWT, enkripsi, email
  docs/               # Konfigurasi Swagger dan dokumentasi API
  index.ts            # Entry point aplikasi
```

Penjelasan folder penting:
- `src/controllers` : berisi controller untuk register, login, profil, OTP
- `src/middlewares` : berisi middleware autentikasi untuk memverifikasi token
- `src/models` : berisi model pengguna yang dipetakan ke MongoDB
- `src/routes` : mengatur endpoint API
- `src/utils` : berisi utilitas seperti koneksi database, JWT, enkripsi, kirim email
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

## Local Setup

### Prerequisites

Sebelum menjalankan project ini di local, pastikan perangkat sudah menyiapkan:
- Node.js versi 22.x
- npm atau yarn
- MongoDB local atau akun MongoDB Atlas
- Akun email SMTP untuk mengirim OTP

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
```

Keterangan:
- `DATABASE_URL` adalah URL koneksi MongoDB
- `SECRET` digunakan untuk menandatangani JWT
- `EMAIL_FROM` dan `EMAIL_APP_PASSWORD` digunakan untuk SMTP email OTP
- `CLIENT_HOST` digunakan untuk redirect atau link frontend jika dibutuhkan

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
