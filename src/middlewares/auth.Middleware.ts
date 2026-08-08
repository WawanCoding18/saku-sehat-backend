import { NextFunction, Request, Response } from "express";
import { IUserToken } from "../utils/jwt";
import { generateUser } from "../utils/jwt";
import connect from "../utils/database";
import BlacklistTokenModel from "../models/blacklistToken.model";


export interface IReqUser extends Request {
  user?: IUserToken;
}

export default async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers?.authorization;
  if (!authorization) {
    return res.status(403).json({
      message: "unauthorized no token",
      data: null,
    });
  }

  const [prefix, accessToken] = authorization.split(" ");

  if (!(prefix === "Bearer" && accessToken)) {
    return res.status(403).json({
      message: "unauthorized wrong format",
      data: null,
    });
  }

  try {
    await connect();
 
    const blacklisted = await BlacklistTokenModel.findOne({ token: accessToken });
    if (blacklisted) {
      return res.status(403).json({
        message: "unauthorized token has been revoked, please login again",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "failed to verify token status",
      data: null,
    });
  }

//generate user dari access token
  const user = generateUser(accessToken);

  if (!user) {
    return res.status(403).json({
      message: "unauthorized invalid user",
      data: null,
    });
  }

  (req as IReqUser).user = user;

  next();
};
