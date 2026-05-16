import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);


const prisma = new PrismaClient({
  log: process.env.NODE_ENV ? ["query", "info", "warn", "error"] : ["error"],
  errorFormat: 'pretty',
  adapter
});

export const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error: any) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
}

export const disconnectDb = async () => {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected");
  } catch (error: any) {
    console.error(`Database disconnect failed: ${error.message}`);
  }
}

export default prisma;