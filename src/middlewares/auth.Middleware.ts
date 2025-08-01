import { NextFunction, Request, Response } from "express";
import { IUserToken } from "../utils/jwt";
import { generateUser } from "../utils/jwt";

// Memperluas tipe bawaan Request agar bisa menyimpan data user hasil verifikasi token
export interface IReqUser extends Request {
  user?: IUserToken;
}

// Middleware untuk memverifikasi token dan mengambil data user dari token
export default (req: Request, res: Response, next: NextFunction) => {
  // Mengambil isi header Authorization (misalnya: "Bearer eyJhbGciOi...")
  const authorization = req.headers?.authorization;

  // Jika header Authorization tidak ada
  if (!authorization) {
    return res.status(403).json({
      message: "unauthorized no token",
      data: null,
    });
  }

  // Memisahkan prefix "Bearer" dan token-nya (dipisah dengan spasi)
  const [prefix, accessToken] = authorization.split(" ");

  // Jika format tidak sesuai: harus "Bearer <token>"
  if (!(prefix === "Bearer" && accessToken)) {
    return res.status(403).json({
      message: "unauthorized wrong format",
      data: null,
    });
  }

  // Decode dan verifikasi token untuk mendapatkan data user dari payload JWT
  const user = generateUser(accessToken);

  // Jika token tidak valid atau gagal diverifikasi
  if (!user) {
    return res.status(403).json({
      message: "unauthorized invalid user",
      data: null,
    });
  }

  // Simpan data user hasil verifikasi ke dalam request (agar bisa diakses di controller)
  (req as IReqUser).user = user;

  // Lanjut ke controller berikutnya (misalnya ke authController.me)
  next();
};
