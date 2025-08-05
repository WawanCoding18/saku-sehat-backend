import swaggerAutogen from "swagger-autogen";

//Swagger membaca file swagger.json dan mengenerate kode API
const outputFile = "./swagger_output.json";
//Untuk endpoint saat buka swaggerUI
const endpointsFiles = [__dirname + "/../routes/api.ts"];
console.log("Resolved path: ", __dirname + "/../routes/api.ts");

//Dokumentasi API terdiri dari info, server, authorization, dan scheme login request
const doc = {
  info: {
    version: "1.0.0",
    title: "Dokumentasi API Acara",
    description: "Dokumentasai API Acara",
  },
  servers: [
    {
      url: "http://localhost:4000/api",
      description: "Local Server",
    },
    {
      url: "https://back-end-event-phi.vercel.app/api",
      description: "Deploy Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      RegisterRequest: {
        fullname:"any",
        username: "any",
        email: "any",
        password: "any",
        confirmPassword:"any"

      },
      LoginRequest: {
        identifier: "Apis",
        password: "2345691",
      },
      ActivationRequest: {
        code: "abcdfg"
      },
    },
  },
};

//Menampilkan Dokumentasi API lewat Swagger UI
swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
