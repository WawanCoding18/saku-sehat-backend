// import express from "express";
// import router from "./routes/api";
// import db from "./utils/database";
// import docs from "./docs/route";
// import cors from "cors";

// // Create an Express application
// const app = express();

// async function startServer() {
//   try {
//     // Connect to the database
//     const dbConnection = await db();
//     console.log(dbConnection);

//     // Middleware to parse JSON bodies and cors
//     app.use(cors({ origin: "http://localhost:3000", credentials: true }));
//     app.use(express.json());

//     app.get("/", (req, res) => {
//       res.status(200).json({
//         message: "Server running",
//         data: null,
//       });
//     });
//     // Use the API routes
//     app.use("/api", router);

//     //call fucntion with params app from route to swaggerUI
//     docs(app);
//     // Start the server
//     const PORT = 4000;
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Error starting the server:", error);
//   }
// }

// startServer();
// module.exports = app;


// import express from "express";
// import router from "./routes/api";
// import db from "./utils/database";
// import docs from "./docs/route";
// import cors from "cors";

// const app = express();


// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.status(200).json({
//     message: "Server running",
//     data: null,
//   });
// });

// app.use("/api", router);
// docs(app);


// db().then((conn) => {
//   console.log("DB Connected:", conn);
// }).catch((err) => {
//   console.error("DB Error:", err);
// });


// if (process.env.NODE_ENV !== "production") {
//   app.listen(4000, () => {
//     console.log("Server running on port 4000");
//   });
// }


// export default app;


import express from "express";
import router from "./routes/api";
import db from "./utils/database";
import docs from "./docs/route";
import cors from "cors";

const app = express();

app.use(cors({ 
  origin: ["http://localhost:3000", "https://saku-sehat-frontends.vercel.app"], 
  credentials: true 
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server running",
    data: null,
  });
});

app.use("/api", router);
docs(app);

db().then((conn) => {
  console.log("DB Connected:", conn);
}).catch((err) => {
  console.error("DB Error:", err);
});

if (process.env.NODE_ENV !== "production") {
  app.listen(4000, () => {
    console.log("Server running on port 4000");
  });
}

export default app;