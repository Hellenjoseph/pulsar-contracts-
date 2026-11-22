import express from "express";
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

const app = express();
app.use(express.json({ limit: "64kb" }));
app.use(createRouter(RPC_URL, CONTRACT_ID));

// Map body-parser payload errors to HTTP 413 responses.
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (
      err &&
      (err.type === "entity.too.large" ||
        err.name === "PayloadTooLargeError" ||
        err.status === 413 ||
        err.statusCode === 413)
    ) {
      res.status(413).json({ error: "Payload too large" });
      return;
    }
    next(err);
  }
);

app.listen(PORT, () => {
  console.log(`[api] Webhook service listening on port ${PORT}`);
  startListener(RPC_URL, CONTRACT_ID, POLL_INTERVAL_MS);
});