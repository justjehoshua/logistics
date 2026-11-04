import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter, trackLimiter } from "./middleware/rateLimit.js";
import { AppError } from "./utils/AppError.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { shipmentsRouter } from "./modules/shipments/shipments.routes.js";
import { trackingRouter } from "./modules/tracking/tracking.routes.js";

export const app = express();

// Phase 7: behind a host's reverse proxy, set 'trust proxy' to the right number of hops
// (check your host's documentation). A wrong value lets attackers fake their IP address

app.use(helmet()); // security headers; also removes X-Powered-By

app.use(
  cors({
    origin: env.CLIENT_URL, // exact match: no trailing slash in CLIENT_URL
    credentials: true,
    methods: ["GET", "POST", "PATCH", "OPTIONS"], // only what our API uses
    allowedHeaders: ["Content-Type"],
    maxAge: 600, // browsers may cache the preflight answer for 10 minutes
  }),
);

app.use(apiLimiter); // after CORS, so even 429 responses carry CORS headers

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/shipments", shipmentsRouter);
app.use("/api/v1/track", trackLimiter, trackingRouter);

app.use((req, res, next) =>
  next(new AppError(404, "NOT_FOUND", "Route not found")),
);

app.use(errorHandler);
