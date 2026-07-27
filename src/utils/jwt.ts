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

//Generate json web token(JWT)
export const generateToken = (user: IUserToken): string => {
  const token = jwt.sign(user, SECRET, {

    //lebih dari sejam bakal expired tokennya
    expiresIn: "1h",
  });

  return token;
};

export const generateUser = (token: string) => {
  const user = jwt.verify(token, SECRET) as IUserToken;
  return user;
};
