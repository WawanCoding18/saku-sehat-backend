import { NextFunction, Request, Response } from "express";
import { IUserToken } from "../utils/jwt";
import { generateUser } from "../utils/jwt";


export interface IReqUser extends Request {
  user?: IUserToken;
}

export default (req: Request, res: Response, next: NextFunction) => {
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
