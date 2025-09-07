import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
import chokidar from "chokidar";
import express from "express";
import { newTransactionWebhook } from "./lib/webhook";
import { convertOtpXlsxToCsv } from "./lib/csv";

const WATCH_FOLDERS = {
  OTP: "./watch/otp_a",
  OTP_N: "./watch/otp_n",
  REVOLUT: "./watch/revolut",
};

// HTTP server to receive webhooks from Firefly III
const app = express();
app.use(express.json());

app.post("/webhook/new-transaction", newTransactionWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Watch the folders for new files
chokidar.watch(WATCH_FOLDERS.OTP, { usePolling: true }).on("add", (path) => {
  if (path.endsWith(".xlsx")) {
    console.log(`File ${path} has been added`);

    convertOtpXlsxToCsv(path, "OTP_A");

    // Remove the file after processing
    fs.unlinkSync(path);
  }
});

chokidar.watch(WATCH_FOLDERS.OTP_N, { usePolling: true }).on("add", (path) => {
  if (path.endsWith(".xlsx")) {
    console.log(`File ${path} has been added`);

    convertOtpXlsxToCsv(path, "OTP_N");

    // Remove the file after processing
    fs.unlinkSync(path);
  }
});
