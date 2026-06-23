import { User } from "../models/user.model";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { SECRET } from "./env";

// Interface for the data structure that will be embedded into the token
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
  // The MongoDB ObjectId (user._id) will be included in the token
  id?: Types.ObjectId;
}

// Generate a JWT token with selected user data
export const generateToken = (user: IUserToken): string => {
  const token = jwt.sign(user, SECRET, {
    expiresIn: "1h",
  });

  return token;
};

// Verify and decode the JWT token to retrieve user info
export const generateUser = (token: string) => {
  const user = jwt.verify(token, SECRET) as IUserToken;
  return user;
};
