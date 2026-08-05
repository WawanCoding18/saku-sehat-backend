import { NextFunction, Request, Response } from "express";
import { IUserToken, generateUser } from "../utils/jwt";

export interface IReqUser extends Request {
  user?: IUserToken;
}

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers?.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "unauthorized, no token provided",
      data: null,
    });
  }

  const [prefix, accessToken] = authorization.split(" ");

  if (prefix !== "Bearer" || !accessToken) {
    return res.status(401).json({
      message: "unauthorized, wrong format",
      data: null,
    });
  }

  // BUNGKUS DENGAN TRY-CATCH DI SINI
  try {
    const user = generateUser(accessToken);

    if (!user) {
      return res.status(401).json({
        message: "unauthorized, invalid user",
        data: null,
      });
    }

    (req as IReqUser).user = user;
    next();
  } catch (error: any) {
    // Tangkap error jwt malformed / jwt expired / dsb
    return res.status(401).json({
      message: error?.message || "unauthorized, invalid or expired token",
      data: null,
    });
  }
};