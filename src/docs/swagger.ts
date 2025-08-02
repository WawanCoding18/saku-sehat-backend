import swaggerAutogen from "swagger-autogen";

const outputFile = "./swagger_output.json";
const endpointsFiles = [__dirname + "/../routes/api.ts"];
console.log("Resolved path: ", __dirname + "/../routes/api.ts");


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
      LoginRequest: {
        identifier: "Apis",
        password: "2345691",
      },
    },
  },
};

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
