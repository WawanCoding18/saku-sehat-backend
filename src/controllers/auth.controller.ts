// import { Request, Response } from "express";
// import * as Yup from "yup";
// import UserModel from "../models/user.model";
// import { encrypt } from "../utils/Encryption";
// import { generateToken } from "../utils/jwt";
// import { IReqUser } from "../middlewares/auth.Middleware";
// import connect from "../utils/database";
// //create a type for register
// type TyRegister = {
//   fullName: string;
//   username: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
// };

// //create type for login
// type TyLogin = {
//   identifier: string;
//   password: string;
// };

// //create a schema for register validation using yup
// const registerSchema = Yup.object({
//   fullName: Yup.string().required(),
//   username: Yup.string().required(),
//   email: Yup.string().email().required(),
//   password: Yup.string()
//     .min(6, "Password must be at least 6 character")
//     .test(
//       "at-least-one-uppercase-letter",
//       "Contains at least one uppercase letter",
//       (value) => {
//         if (!value) return false;
//         const regex = /^(?=.*[A-Z])/;
//         return regex.test(value);
//       }
//     )
//     .test(
//       "at-least-number-letter",
//       "Contains at least one uppercase letter",
//       (value) => {
//         if (!value) return false;
//         const regex = /^(?=.*\d)/;
//         return regex.test(value);
//       }
//     )
//     .required(),
//   confirmPassword: Yup.string()
//     .oneOf([Yup.ref("password"), ""], "Passwords must match")
//     .required(),
// });

// //create controller for register, login, me, and activation with default export
// export default {
//   async register(req: Request, res: Response) {
//     /*
//     #swagger.tags = ['Auth']
//     #swagger.description = 'Register a new user'
//     #swagger.requestBody = {
//       required: true,
//       content: {
//         "application/json": {
//           schema: {
//             $ref: "#/components/schemas/RegisterRequest"
//           }
//         }
//       }
//     }
//   */await connect();

//     const body = req.body as unknown as TyRegister;

//     // Validate if body is empty
//     if (!body || Object.keys(body).length === 0) {
//       return res.status(400).json({
//         message: "Request body is missing",
//         error: "Please send registration data",
//         data: null,
//       });
//     }

//     const { fullName, username, email, password, confirmPassword } = body;

//     try {
//       // Validate with schema Yup
//       await registerSchema.validate({
//         fullName,
//         username,
//         email,
//         password,
//         confirmPassword,
//       });

//       //call the UserModel model to create a new user
//       const result = await UserModel.create({
//         fullName,
//         username,
//         email,
//         password,
//       });

//       res.status(200).json({
//         message: "Registration successful",
//         data: result,
//       });
//     } catch (error) {
//       const err = error as unknown as Error;
//       res.status(400).json({
//         message: "Validation error",
//         error: err.message,
//         data: null,
//       });
//     }
//   },

//   async login(req: Request, res: Response) {
//     /**
//  #swagger.tags = ['Auth']
//  #swagger.description = 'Login User'
//  #swagger.requestBody = {
//    required: true,
//    content: {
//      "application/json": {
//        schema: {
//          $ref: "#/components/schemas/LoginRequest"
//        }
//      }
//    }
//  }
//  */
//     await connect();
//     const { identifier, password } = req.body as unknown as TyLogin;

//     try {
//       //Identify user filling based on username or emai
//       const userByIndentifier = await UserModel.findOne({
//         $or: [
//           { username: identifier },
//           {
//             email: identifier,
//           },
//         ],

//         isActive: true,
//       });

//       // If user is not found
//       if (!userByIndentifier) {
//         return res.status(403).json({
//           message: "User not found",
//           data: null,
//         });
//       }

//       // Password validation must match the encrypted password
//       const validPassword: boolean =
//         encrypt(password) === userByIndentifier.password;

//       // If the password does not match
//       if (!validPassword) {
//         return res.status(403).json({
//           message: "Password Error",
//           data: null,
//         });
//       }

//       // This token will include only the MongoDB id and role from the user document
//       const token = generateToken({
//         id: userByIndentifier._id,
//         role: userByIndentifier.role,
//       });

//       res.status(200).json({
//         message: "Login successful",
//         data: token,
//       });
//     } catch (error) {
//       const err = error as unknown as Error;
//       res.status(400).json({
//         message: "Login failed",
//         error: err.message,
//         data: null,
//       });
//     }
//   },

//   async me(req: IReqUser, res: Response) {
//     /**
//       #swagger.tags = ['Auth']
//       #swagger.security = [{ bearerAuth: [] }]
//      */
//     await connect();
//     try {
//       // retrieve user data that has been inserted by the auth middleware
//       const user = req.user;

//       // search for user data in the database based on the id from the token
//       const result = await UserModel.findById(user?.id);

//       res.status(200).json({
//         message: "Success Get User Profile",
//         data: result,
//       });
//     } catch (error) {
//       const err = error as unknown as Error;
//       res.status(400).json({
//         message: "Login failed",
//         error: err.message,
//         data: null,
//       });
//     }
//   },

//   async activation(req: Request, res: Response) {
//     /*
//     #swagger.tags = ['Auth']
//     #swagger.description = 'Activation Code'
//     #swagger.requestBody = {
//       required: true,
//       content: {
//         "application/json": {
//           schema: {
//             $ref: "#/components/schemas/ActivationRequest"
//           }
//         }
//       }
//     }
//   */ await connect();
//     try {
//       //	Get the activation code from frontend
//       const { code } = req.body as { code: string };

//       const user = await UserModel.findOneAndUpdate(
//         {
//           //Find user with that activation code
//           activation: code,
//         },
//         {
//           //Update user to be active.
//           isActive: true,
//         },
//         {
//           //Get the updated user (after activation) as a result.
//           new: true,
//         }
//       );

//       res.status(200).json({
//         message: "User Successfully activated ",
//         data: user,
//       });
//     } catch (error) {
//       const err = error as unknown as Error;
//       res.status(400).json({
//         message: "Login failed",
//         error: err.message,
//         data: null,
//       });
//     }
//   },
// };

import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/Encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.Middleware";
import connect from "../utils/database";
import { sendOTPEmail, generateOTP } from "../utils/mail/mail";

// ── Types ────────────────────────────────────────────────────
type TyRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TyLogin = {
  identifier: string;
  password: string;
};

// ── Yup Validation Schema ────────────────────────────────────
const registerSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .test(
      "at-least-one-uppercase-letter",
      "Password must contain at least one uppercase letter",
      (value) => {
        if (!value) return false;
        return /^(?=.*[A-Z])/.test(value);
      }
    )
    .test(
      "at-least-one-number",
      "Password must contain at least one number",
      (value) => {
        if (!value) return false;
        return /^(?=.*\d)/.test(value);
      }
    )
    .required(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), ""], "Passwords must match")
    .required(),
});

// ── Controllers ──────────────────────────────────────────────
export default {
  async register(req: Request, res: Response) {
    /*
      #swagger.tags = ['Auth']
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" }
          }
        }
      }
    */
    try {
      // 1. Hubungkan database di dalam try agar jika gagal bisa ditangkap catch
      await connect();

      const body = req.body as unknown as TyRegister;
      if (!body || Object.keys(body).length === 0) {
        return res.status(400).json({
          message: "Request body is missing",
          error: "Please send registration data",
          data: null,
        });
      }

      const { fullName, username, email, password, confirmPassword } = body;

      // Validasi input dengan Yup
      await registerSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      // Cek apakah email atau username sudah terdaftar
      const existingUser = await UserModel.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        // Solusi Deadlock: Jika user sudah terdaftar tapi BELUM AKTIF, update OTP baru
        if (!existingUser.isActive) {
          const otpCode = generateOTP();
          const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

          await UserModel.findByIdAndUpdate(existingUser._id, {
            otpCode,
            otpExpiresAt,
            password, // Update password barangkali mereka menggantinya
          });

          await sendOTPEmail(email, fullName, otpCode);

          return res.status(200).json({
            message: "Registration updated. Please check your email for the new OTP code.",
            data: { email },
          });
        }

        return res.status(400).json({
          message: "Email or username already registered",
          error: "Please use a different email or username",
          data: null,
        });
      }

      // Generate OTP 6 digit dan waktu expired 5 menit
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Simpan user baru ke MongoDB
      await UserModel.create({
        fullName,
        username,
        email,
        password,
        otpCode,
        otpExpiresAt,
        isActive: false,
      });

      // Kirim OTP ke email user via Gmail
      await sendOTPEmail(email, fullName, otpCode);

      res.status(200).json({
        message: "Registration successful. Please check your email for OTP code.",
        data: { email },
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: "Registration failed",
        error: err.message,
        data: null,
      });
    }
  },

  async verifyOTP(req: Request, res: Response) {
    /*
      #swagger.tags = ['Auth']
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VerifyOTPRequest" }
          }
        }
      }
    */
    try {
      await connect();

      // Destructuring dipindahkan ke dalam try agar aman dari error undefined body
      const { email, otpCode } = req.body as { email: string; otpCode: string };

      if (!email || !otpCode) {
        return res.status(400).json({
          message: "Email and OTP code are required",
          data: null,
        });
      }

      // Cari user berdasarkan email
      const user = await UserModel.findOne({ email });

      // User tidak ditemukan
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          data: null,
        });
      }

      // Akun sudah aktif sebelumnya
      if (user.isActive) {
        return res.status(400).json({
          message: "Account already activated",
          data: null,
        });
      }

      // Cek apakah OTP sudah expired
      if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
        return res.status(400).json({
          message: "OTP has expired. Please request a new one.",
          data: null,
        });
      }

      // Cek apakah OTP cocok
      if (user.otpCode !== otpCode) {
        return res.status(400).json({
          message: "Invalid OTP code",
          data: null,
        });
      }

      // Semua valid → aktifkan akun dan hapus OTP dari database
      await UserModel.findByIdAndUpdate(user._id, {
        isActive: true,
        otpCode: null,
        otpExpiresAt: null,
      });

      res.status(200).json({
        message: "Account activated successfully! You can now login.",
        data: null,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: "OTP verification failed",
        error: err.message,
        data: null,
      });
    }
  },

  async resendOTP(req: Request, res: Response) {
    /*
      #swagger.tags = ['Auth']
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ResendOTPRequest" }
          }
        }
      }
    */
    try {
      await connect();

      const { email } = req.body as { email: string };
      if (!email) {
        return res.status(400).json({
          message: "Email is required",
          data: null,
        });
      }

      // Cari user yang belum aktif
      const user = await UserModel.findOne({ email, isActive: false });

      if (!user) {
        return res.status(404).json({
          message: "User not found or already activated",
          data: null,
        });
      }

      // Generate OTP baru
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Update OTP baru ke database
      await UserModel.findByIdAndUpdate(user._id, {
        otpCode,
        otpExpiresAt,
      });

      // Kirim OTP baru ke email
      await sendOTPEmail(email, user.fullName, otpCode);

      res.status(200).json({
        message: "New OTP sent to your email",
        data: null,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: "Failed to resend OTP",
        error: err.message,
        data: null,
      });
    }
  },

  async login(req: Request, res: Response) {
    /*
      #swagger.tags = ['Auth']
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" }
          }
        }
      }
    */
    try {
      await connect();

      const { identifier, password } = req.body as unknown as TyLogin;
      if (!identifier || !password) {
        return res.status(400).json({
          message: "Identifier and password are required",
          data: null,
        });
      }

      // Cari user berdasarkan username atau email
      const user = await UserModel.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });

      // User tidak ditemukan
      if (!user) {
        return res.status(403).json({
          message: "User not found",
          data: null,
        });
      }

      // Akun belum diverifikasi OTP
      if (!user.isActive) {
        return res.status(403).json({
          message: "Account not activated. Please verify your OTP first.",
          data: null,
        });
      }

      // Cek password cocok dengan yang di database
      const validPassword: boolean = encrypt(password) === user.password;

      if (!validPassword) {
        return res.status(403).json({
          message: "Wrong password",
          data: null,
        });
      }

      // Generate JWT token berisi id dan role user
      const token = generateToken({
        id: user._id,
        role: user.role,
        otpCode: user.otpCode,
        otpExpiresAt: user.otpExpiresAt,
      });

      res.status(200).json({
        message: "Login successful",
        data: token,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: "Login failed",
        error: err.message,
        data: null,
      });
    }
  },

  async me(req: IReqUser, res: Response) {
    /*
      #swagger.tags = ['Auth']
      #swagger.security = [{ bearerAuth: [] }]
    */
    try {
      await connect();

      // Ambil data user dari token yang sudah diverifikasi middleware
      const user = req.user;

      // Cari data lengkap user di database berdasarkan id dari token
      const result = await UserModel.findById(user?.id);

      res.status(200).json({
        message: "Success get user profile",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: "Failed to get user profile",
        error: err.message,
        data: null,
      });
    }
  },
};