import express from "express";
import cors from "cors";
import { createAnalyticsRouter } from "./api";

const PORT = Number(process.env.PORT ?? 3100);
const DATABASE_URL = process.env.DATABASE_URL ?? "";
const NODE_ENV = process.env.NODE_ENV ?? "development";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ?? "";

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

function parseAllowedOrigins(value: string): string[] {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function buildCorsOptions(): cors.CorsOptions {
  if (NODE_ENV === "production") {
    const allowedOrigins = parseAllowedOrigins(ALLOWED_ORIGINS);
    return {
      origin: (origin, callback) => {
        // Allow same-origin / non-browser requests (no Origin header).
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        // Default deny in production.
        callback(null, false);
      },
    };
  }

  // Development: allow all origins.
  return { origin: true };
}

const app = express();
app.use(cors(buildCorsOptions()));
app.use(express.json());
app.use(createAnalyticsRouter(DATABASE_URL));

app.listen(PORT, () => {
  console.log(`[analytics] Service listening on port ${PORT}`);
});

export { app, buildCorsOptions, parseAllowedOrigins };