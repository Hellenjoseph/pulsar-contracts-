import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/errors.js";
import merchantsRouter from "./routes/merchants.js";
import paymentsRouter from "./routes/payments.js";

export function buildCorsOptions(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";

  const allowedOrigins = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (!isProduction) {
    // Development: allow all origins.
    return {
      origin: true,
      credentials: true,
    };
  }

  // Production: default deny. Only allow origins explicitly listed in
  // ALLOWED_ORIGINS. Requests without an Origin header (e.g. same-origin,
  // server-to-server) are permitted since they are not cross-origin.
  return {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  };
}

export function createApp(env = process.env) {
  const app = express();

  app.use(cors(buildCorsOptions(env)));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/merchants", merchantsRouter);
  app.use("/api/payments", paymentsRouter);

  app.use(errorMiddleware);

  return app;
}

const app = createApp();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Pulsar API running on port ${PORT}`));

export default app;