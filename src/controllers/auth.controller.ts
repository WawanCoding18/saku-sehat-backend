import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/Encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.Middleware";

//membuat type untuk register
type TyRegister = {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

//membuat type untuk login
type TyLogin = {
  identifier: string;
  password: string;
};

//membuat schema untuk validasi register pake yup
const registerSchema = Yup.object({
  fullname: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string()
    .min(6, "Password must be at least 6 character")
    .test(
      "at-least-one-uppercase-letter",
      "Contains at least one uppercase letter",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
      }
    )
    .test(
      "at-least-number-letter",
      "Contains at least one uppercase letter",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*\d)/;
        return regex.test(value);
      }
    )
    .required(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), ""], "Passwords must match")
    .required(),
});

//membuat controller untuk register,login dan me dengan export default
export default {
  async register(req: Request, res: Response) {
    /*
    #swagger.tags = ['Auth']
    #swagger.description = 'Register a new user'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/RegisterRequest"
          }
        }
      }
    }
  */

    const body = req.body as unknown as TyRegister;

    // Validasi jika body kosong
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "Request body is missing",
        error: "Please send registration data",
        data: null,
      });
    }

    const { fullname, username, email, password, confirmPassword } = body;

    try {
      // Validasi dengan schema Yup
      await registerSchema.validate({
        fullname,
        username,
        email,
        password,
        confirmPassword,
      });

      //memanggil model UserModel untuk membuat user baru
      const result = await UserModel.create({
        fullname,
        username,
        email,
        password,
      });

      res.status(200).json({
        message: "Registration successful",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: "Validation error",
        error: err.message,
        data: null,
      });
    }
  },

  async login(req: Request, res: Response) {
    /**
 #swagger.tags = ['Auth']
 #swagger.description = 'Login User'
 #swagger.requestBody = {
   required: true,
   content: {
     "application/json": {
       schema: {
         $ref: "#/components/schemas/LoginRequest"
       }
     }
   }
 }
 */

    const { identifier, password } = req.body as unknown as TyLogin;

    try {
      //Mengidentifikasi user mengisi berdasarkan username atau email
      const userByIndentifier = await UserModel.findOne({
        $or: [
          { username: identifier 

          },{
            
            email: identifier 

          }],

          isActive: true
      });

      // Jika user tidak ditemukan
      if (!userByIndentifier) {
        return res.status(403).json({
          message: "User not found",
          data: null,
        });
      }

      // Validasi password harus sesuai dengan pasword yang terenkripsi
      const validPassword: boolean =
        encrypt(password) === userByIndentifier.password;

      // Jika password tidak sesuai
      if (!validPassword) {
        return res.status(403).json({
          message: "Password Error",
          data: null,
        });
      }

      // This token will include only the MongoDB id and role from the user document
      const token = generateToken({
        id: userByIndentifier._id,
        role: userByIndentifier.role,
      });

      res.status(200).json({
        message: "Login successful",
        data: token,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: "Login failed",
        error: err.message,
        data: null,
      });
    }
  },

  async me(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Auth']
      #swagger.security = [{ bearerAuth: [] }]
     */

    try {
      // mengambil data user yang sudah disisipkan oleh middleware auth
      const user = req.user;

      // mencari data user di database berdasarkan id dari token
      const result = await UserModel.findById(user?.id);

      res.status(200).json({
        message: "Success Get User Profile",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: "Login failed",
        error: err.message,
        data: null,
      });
    }
  },

  async activation(req: Request, res: Response) {
    /*
    #swagger.tags = ['Auth']
    #swagger.description = 'Activation Code'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/ActivationRequest"
          }
        }
      }
    }
  */
    try {
      const { code } = req.body as { code: string };

      const user = await UserModel.findOneAndUpdate(
        {
          activation: code,
        },
        {
          isActive: true,
        },
        {
          new: true,
        }
      );

      res.status(200).json({
        message: "User Successfully activated ",
        data: user,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: "Login failed",
        error: err.message,
        data: null,
      });
    }
  },
};
