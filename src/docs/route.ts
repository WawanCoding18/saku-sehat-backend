import { Express } from "express";
import SwaggerUI from "swagger-ui-express";
import SwaggerOutput from "./swagger_output.json";
import fs from "fs";
import path from "path";

//Mengesport kan Swagger UI ke index.ts
export default function docs(app: Express) {
  //Membaca filesystem untuk mendapatkan path dari swagger-ui.css
  const css = fs.readFileSync(
    path.resolve(
      __dirname,
      "../../node_modules/swagger-ui-dist/swagger-ui.css"
    ),
    "utf-8"
  );

  //middleware untuk mengesport Swagger UI dari swagger_ouput.json dan ui css nya dari swagger-ui.css
  app.use(
    "/api-docs",
    SwaggerUI.serve,
    SwaggerUI.setup(SwaggerOutput, {
      customCss: css,
    })
  );
}
