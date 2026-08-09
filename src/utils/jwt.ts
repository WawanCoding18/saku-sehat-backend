import { User } from "../models/user.model";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { SECRET } from "./env";

export interface IUserToken
  extends Omit<
    User,
    | "activation"
    | "isActive"
    | "profilePicture"
    | "password"
    | "email"
    | "username"
    | "fullName"
  > {
  id?: Types.ObjectId;
}

export const generateToken = (user: IUserToken): string => {
  const token = jwt.sign(user, SECRET, {
    expiresIn: "2h", //expired saat sudah 2 jam 
  });

  return token;
};

export const generateUser = (token: string): IUserToken | null => {
  try {
    //jwt.verify akan membaca token dan memverifikasi signature-nya
    const user = jwt.verify(token, SECRET) as IUserToken;
    return user;
  } catch (error) {
    return null;
  }
};