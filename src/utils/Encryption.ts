import Crypto from "crypto";
import { SECRET } from "./env";

// Function to encrypt a password using PBKDF2
export const encrypt = (password: string): string => {
  const encrypted = Crypto.pbkdf2Sync(
    password,
    SECRET,
    1000,
    64,
    "sha512"
  ).toString("hex");
  return encrypted;
};

