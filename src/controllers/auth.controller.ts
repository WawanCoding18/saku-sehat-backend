import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/Encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.Middleware";
import connect from "../utils/database";
//create a type for register
type TyRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

//create type for login
type TyLogin = {
  identifier: string;
  password: string;
};

//create a schema for register validation using yup
const registerSchema = Yup.object({
  fullName: Yup.string().required(),
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

//create controller for register, login, me, and activation with default export
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
  */await connect();

    const body = req.body as unknown as TyRegister;

    // Validate if body is empty
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        message: "Request body is missing",
        error: "Please send registration data",
        data: null,
      });
    }

    const { fullName, username, email, password, confirmPassword } = body;

    try {
      // Validate with schema Yup
      await registerSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      //call the UserModel model to create a new user
      const result = await UserModel.create({
        fullName,
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
    await connect();
    const { identifier, password } = req.body as unknown as TyLogin;

    try {
      //Identify user filling based on username or emai
      const userByIndentifier = await UserModel.findOne({
        $or: [
          { username: identifier },
          {
            email: identifier,
          },
        ],

        isActive: true,
      });

      // If user is not found
      if (!userByIndentifier) {
        return res.status(403).json({
          message: "User not found",
          data: null,
        });
      }

      // Password validation must match the encrypted password
      const validPassword: boolean =
        encrypt(password) === userByIndentifier.password;

      // If the password does not match
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
    await connect();
    try {
      // retrieve user data that has been inserted by the auth middleware
      const user = req.user;

      // search for user data in the database based on the id from the token
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
  */ await connect();
    try {
      //	Get the activation code from frontend
      const { code } = req.body as { code: string };

      const user = await UserModel.findOneAndUpdate(
        {
          //Find user with that activation code
          activation: code,
        },
        {
          //Update user to be active.
          isActive: true,
        },
        {
          //Get the updated user (after activation) as a result.
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
