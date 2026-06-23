import { NextFunction, Request, Response } from "express";
import { IUserToken } from "../utils/jwt";
import { generateUser } from "../utils/jwt";

// Extend the default Request type to store user data resulting from token verification
export interface IReqUser extends Request {
  user?: IUserToken;
}

// Middleware to verify token and retrieve user data from token
export default (req: Request, res: Response, next: NextFunction) => {
  // Get the contents of the Authorization header (e.g.: "Bearer eyJhbGciOi...")
  const authorization = req.headers?.authorization;

  // If Authorization header is missing
  if (!authorization) {
    return res.status(403).json({
      message: "unauthorized no token",
      data: null,
    });
  }

  // Separate the "Bearer" prefix and its tokens (separated by spaces
  const [prefix, accessToken] = authorization.split(" ");

  // If format is not correct: must be "Bearer <token>"
  if (!(prefix === "Bearer" && accessToken)) {
    return res.status(403).json({
      message: "unauthorized wrong format",
      data: null,
    });
  }

  // Decode and verify the token to get user data from the JWT payload
  const user = generateUser(accessToken);

  // If the token is invalid or fails to verify
  if (!user) {
    return res.status(403).json({
      message: "unauthorized invalid user",
      data: null,
    });
  }

  // Save the verified user data into the request (so it can be accessed in the controller)
  (req as IReqUser).user = user;

  // Continue to the next controller (e.g. to authController.me)
  next();
};
