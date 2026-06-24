// import mongoose from "mongoose";
// import {DATABASE_URL} from "./env";

// //connect from backend to mongoDB
// const connect = async () => {
//     try{
//         await mongoose.connect(DATABASE_URL,{
//             dbName: "db-acara"
//         })

//         return Promise.resolve("Database connected successfully");

//     }catch (error) {
    
//         return Promise.reject(`Failed to connect to database: ${error}`);
//     }
// }

// export default connect;

import mongoose from "mongoose";
import { DATABASE_URL } from "./env";

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in your environment variables");
}

// 1. Ambil atau siapkan tempat penyimpanan koneksi di memori global Node.js
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

const connect = async () => {
    // 2. Jika sudah ada koneksi aktif dari request sebelumnya, langsung pakai
    if (cached.conn) {
        return "Database already connected (cached)";
    }

    // 3. Jika belum ada koneksi, buat jembatan koneksi baru
    if (!cached.promise) {
        const opts = {
            dbName: "db-acara",
            bufferCommands: false, // Matikan buffering agar langsung error jika koneksi putus, ga nunggu timeout kelamaan
        };

        cached.promise = mongoose.connect(DATABASE_URL, opts).then((mongooseInstance) => {
            return mongooseInstance;
        });
    }

    try {
        // Tunggu sampai koneksinya berhasil terbentuk
        cached.conn = await cached.promise;
        return "Database connected successfully";
    } catch (error) {
        cached.promise = null; // Reset promise jika gagal, biar request berikutnya bisa mencoba konek lagi
        throw new Error(`Failed to connect to database: ${error}`);
    }
};

export default connect;