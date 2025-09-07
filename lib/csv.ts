import fs from "fs";
import * as XLSX from "xlsx";
import md5 from "md5";
import moment from "moment";

const IMPORT_FOLDER = "./import";
const FIREFLY_CONFIG_DIR = "./firefly-config";

export const convertOtpXlsxToCsv = (
  path: string,
  account: "OTP_A" | "OTP_N",
) => {
  const workbook = XLSX.readFile(path);

  // Get the active worksheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const transactions: Array<Array<string | number>> = XLSX.utils.sheet_to_json(
    worksheet,
    { header: 1 },
  );

  // Remove the header
  transactions.shift();

  // Add a unique id to each transaction using the md5 hash of the transaction date (first column)
  // and adding a copy of the fifth column to the end of the row
  const transactionsModified = transactions.map((transaction) => {
    const key = account === "OTP_A" ? "otp" : "otp_n"; // backword compatibility

    const id = md5(key + transaction[0].toString());
    const date = moment(transaction[0].toString()).format("YYYY-MM-DD HH:mm");
    return [id, ...transaction, transaction[4], date];
  });

  const modifiedSheet = XLSX.utils.json_to_sheet(transactionsModified, {
    skipHeader: true,
  });

  const csvData = XLSX.utils.sheet_to_csv(modifiedSheet);

  const fileName = `${account}_${new Date().toISOString()}`;

  // Save the csv file to the import folder
  fs.writeFileSync(`${IMPORT_FOLDER}/${fileName}.csv`, csvData);

  const configFilePathMap = {
    OTP_A: "otp_a.json",
    OTP_N: "otp_n.json",
  };

  // Save the config with the same file name
  fs.copyFileSync(
    `${FIREFLY_CONFIG_DIR}/${configFilePathMap[account]}`,
    `${IMPORT_FOLDER}/${fileName}.json`,
  );
};
