import express from "express";
import cors from "cors";
import { createRouter } from "./api";
import { startListener } from "./listener";

const PORT = Number(process.env.PORT ?? 3001);
const RPC_URL = process.env.RPC_URL ?? "https://soroban-testnet.stellar.org";
const CONTRACT_ID = process.env.CONTRACT_ID ?? "";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 5_000);

if (!CONTRACT_ID) {
  console.error("CONTRACT_ID environment variable is required");
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl) in all modes.
    if (!origin) {
      callback(null, true);
      return;
    }

    // In development, allow all origins.
    if (!isProduction) {
      callback(null, true);
      return;
    }

    // In production, default to denying cross-origin requests unless allowlisted.
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
};

const app = express();
app.use(cors(corsOptions));
app.use(createRouter(RPC_URL, CONTRACT_ID));

app.listen(PORT, () => {
  console.log(`[api] Webhook service listening on port ${PORT}`);
  startListener(RPC_URL, CONTRACT_ID, POLL_INTERVAL_MS);
});

export { app, corsOptions };