import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";
import { errorHandler } from "./middleware/error.middleware";


const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(errorHandler);

app.use(express.json());

//Registered routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tickets", ticketRoutes);

export default app;