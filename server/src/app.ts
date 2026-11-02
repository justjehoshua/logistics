import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import { authRouter } from "./modules/auth/auth.routes.js";

export const app = express();

// 1. CORS: only our frontend may call the API; credentials lets cookies through
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// 2. Body parser: MUST come before the routes, or req.body stays undefined
app.use(express.json({ limit: "10kb" }));

// 3. Routes
app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/v1/auth", authRouter);

// 4. Catch-all: anything that matched no route above lands here
app.use((req, res, next) =>
  next(new AppError(404, "NOT_FOUND", "Route not found")),
);

// 5. Error handler: always last
app.use(errorHandler);
