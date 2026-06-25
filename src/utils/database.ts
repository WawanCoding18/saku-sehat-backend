import mongoose from "mongoose";
import {DATABASE_URL} from "./env";

//connect from backend to mongoDB
const connect = async () => {
    try{
        await mongoose.connect(DATABASE_URL,{
            dbName: "db-acara"
        })

        return Promise.resolve("Database connected successfully");

    }catch (error) {
    
        return Promise.reject(`Failed to connect to database: ${error}`);
    }
}

export default connect;

// import mongoose from "mongoose";
// import { DATABASE_URL } from "./env";

// // Cache koneksi di global variable
// // Karena di Vercel, module bisa di-reload tapi global tetap ada
// declare global {
//   var mongooseCache: {
//     conn: typeof mongoose | null;
//     promise: Promise<typeof mongoose> | null;
//   };
// }

// const cached = global.mongooseCache ?? { conn: null, promise: null };
// global.mongooseCache = cached;

// const connect = async () => {
//   // Kalau sudah ada koneksi aktif, langsung pakai — jangan buat baru
//   if (cached.conn) {
//     return cached.conn;
//   }

//   // Kalau belum ada promise koneksi, buat baru
//   if (!cached.promise) {
//     cached.promise = mongoose.connect(DATABASE_URL, {
//       dbName: "db-acara",
//       // Ini penting buat serverless environment
//       bufferCommands: false,
//     }).then((mongooseInstance) => mongooseInstance);
//   }

//   try {
//     cached.conn = await cached.promise;
//   } catch (error) {
//     // Reset promise kalau gagal, biar bisa retry
//     cached.promise = null;
//     throw new Error(`Failed to connect to database: ${error}`);
//   }

//   return cached.conn;
// };

// export default connect;