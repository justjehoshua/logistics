import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

export const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser()); // fills req.cookies, which authenticate and refresh will read

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);

app.use((req, res, next) =>
  next(new AppError(404, "NOT_FOUND", "Route not found")),
);

app.use(errorHandler);
