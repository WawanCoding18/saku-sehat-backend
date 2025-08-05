import nodemailer from "nodemailer";
import {
  EMAIL_SMTP_USER,
  EMAIL_SMTP_PASS,
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_SECURE,
} from "../env";

import SMTPTransport from "nodemailer/lib/smtp-transport";
import ejs from "ejs";
import path from "path";

// Only use host, not service
const transport = nodemailer.createTransport({
  host: EMAIL_SMTP_HOST,
  port: EMAIL_SMTP_PORT,
  secure: EMAIL_SMTP_SECURE,
  auth: {
    user: EMAIL_SMTP_USER,
    pass: EMAIL_SMTP_PASS,
  },
  requireTLS: true,
} as SMTPTransport.Options);

export interface IsendMail {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ ...emailparams }: IsendMail) => {
  const result = await transport.sendMail({
    ...emailparams,
  });

  return result;
};

export const renderMailHtml = async (template: string, data: any): Promise<string> => {
  const content = await ejs.renderFile(
    path.join(__dirname, `templates/${template}`),
    data
  );

  return content as string;
};
