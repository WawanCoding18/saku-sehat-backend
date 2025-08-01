import express from "express";
import router from "./routes/api";
import db from "./utils/database";

async function startServer() {
  try {
    // Connect to the database
    const dbConnection = await db();
    console.log(dbConnection);

    // Create an Express application
    const app = express();

    // Middleware to parse JSON bodies
    app.use(express.json());

    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server running",
        data: null,
      });
    });
    // Use the API routes
    app.use("/api", router);

    // Start the server
    const PORT = 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}

startServer();
