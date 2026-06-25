// import nodemailer from "nodemailer";
// import {
//   EMAIL_SMTP_USER,
//   EMAIL_SMTP_PASS,
//   EMAIL_SMTP_HOST,
//   EMAIL_SMTP_PORT,
//   EMAIL_SMTP_SECURE,
// } from "../env";

// import SMTPTransport from "nodemailer/lib/smtp-transport";
// import ejs from "ejs";
// import path from "path";

// //what data want to send to email use tools nodemailer
// const transport = nodemailer.createTransport({
//   host: EMAIL_SMTP_HOST,
//   port: EMAIL_SMTP_PORT,
//   secure: EMAIL_SMTP_SECURE,
//   auth: {
//     user: EMAIL_SMTP_USER,
//     pass: EMAIL_SMTP_PASS,
//   },
//   requireTLS: true,
// } as SMTPTransport.Options);

// //export interface isenMail to casting sendMail data
// export interface IsendMail {
//   from: string;
//   to: string;
//   subject: string;
//   html: string;
// }

// //send to email with there are sendMail like from who, to who, subject, and content
// export const sendMail = async ({ ...emailparams }: IsendMail) => {
//   const result = await transport.sendMail({
//     ...emailparams,
//   });

//   return result;
// };

// //render email when email while sending
// export const renderMailHtml = async (template: string, data: any): Promise<string> => {
//   const content = await ejs.renderFile(
//     path.join(__dirname, `templates/${template}`),
//     data
//   );

//   return content as string;
// };

import nodemailer from "nodemailer";
import { EMAIL_FROM, EMAIL_APP_PASSWORD } from "../env";

// ── Nodemailer Transporter ───────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_FROM,
    pass: EMAIL_APP_PASSWORD,
  },
});

// ── Helper: Generate OTP 6 digit ─────────────────────────────
// Ditambahkan dan di-export agar bisa dipakai di controller
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── Helper: Kirim OTP via Gmail ──────────────────────────────
export const sendOTPEmail = async (
  toEmail: string,
  fullName: string,
  otpCode: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"Acara App" <${EMAIL_FROM}>`,
    to: toEmail,
    subject: "Kode OTP Verifikasi Akun Kamu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #333;">Verifikasi Akun Kamu</h2>
        <p>Halo <strong>${fullName}</strong>,</p>
        <p>Masukkan kode OTP berikut untuk mengaktifkan akun:</p>
        <div style="
          background: #f4f4f4;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        ">
          <h1 style="
            letter-spacing: 8px;
            color: #4F46E5;
            font-size: 36px;
            margin: 0;
          ">
            ${otpCode}
          </h1>
        </div>
        <p style="color: #666; font-size: 14px;">
          ⏰ Kode berlaku selama <strong>5 menit</strong>.
        </p>
        <p style="color: #666; font-size: 14px;">
          Abaikan email ini jika kamu tidak mendaftar.
        </p>
      </div>
    `,
  });
};