import "dotenv/config";
import app from "./app";
import { connectDb, disconnectDb } from "./config/prisma"

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

//Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", async (err) => {
  console.error(`Unhandled rejection: ${err}`);

  await disconnectDb();
  process.exit(0);
});

//Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error(`Uncaught Exception: ${err}`);

  await disconnectDb();
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("Shutting down server...");

  await disconnectDb();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Server terminated");

  await disconnectDb();
  process.exit(0);
});