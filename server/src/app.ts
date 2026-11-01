import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";

export const app = express();

// Only OUR frontend may call the API. credentials:true lets cookies through,
// which is why origin can't be '*'
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" })); // request size limit (security)

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

// Anything that didn't match a route above lands here
app.use((req, res, next) =>
  next(new AppError(404, "NOT_FOUND", "Route not found")),
);

app.use(errorHandler); // MUST be last
