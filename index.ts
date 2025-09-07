import fs from "fs";
import chokidar from "chokidar";
import { convertOtpXlsxToCsv } from "./lib/csv";

const WATCH_FOLDERS = {
  OTP: "./watch/otp_a",
  OTP_N: "./watch/otp_n",
  REVOLUT: "./watch/revolut",
};

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
