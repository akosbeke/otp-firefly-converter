import fs from "fs";
import * as XLSX from "xlsx";
import md5 from "md5";
import moment from "moment";
import chokidar from "chokidar";
import * as csv from "csv";

const WATCH_FOLDERS = {
  OTP: "./watch/otp",
  REVOLUT: "./watch/revolut",
};
const IMPORT_FOLDER = "./import";
const FIREFLY_CONFIG_DIR = "./firefly-config";

chokidar.watch(WATCH_FOLDERS.OTP, { usePolling: true }).on("add", (path) => {
  if (path.endsWith(".xlsx")) {
    console.log(`File ${path} has been added`);

    convertOtpXlsxToCsv(path);

    // Remove the file after processing
    fs.unlinkSync(path);
  }
});

chokidar
  .watch(WATCH_FOLDERS.REVOLUT, { usePolling: true })
  .on("add", (path) => {
    if (path.endsWith(".csv")) {
      console.log(`File ${path} has been added`);

      convertRevolutCsvToCsv(path);

      // Remove the file after processing
      fs.unlinkSync(path);
    }
  });

const convertOtpXlsxToCsv = (path: string) => {
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
    const id = md5("otp" + transaction[0].toString());
    const date = moment(transaction[0].toString()).format("YYYY-MM-DD HH:mm");
    return [id, ...transaction, transaction[4], date];
  });

  const modifiedSheet = XLSX.utils.json_to_sheet(transactionsModified, {
    skipHeader: true,
  });

  const csvData = XLSX.utils.sheet_to_csv(modifiedSheet);

  const fileName = `OTP_${new Date().toISOString()}`;

  // Save the csv file to the import folder
  fs.writeFileSync(`${IMPORT_FOLDER}/${fileName}.csv`, csvData);

  // Save the config with the same file name
  fs.copyFileSync(
    `${FIREFLY_CONFIG_DIR}/otp.json`,
    `${IMPORT_FOLDER}/${fileName}.json`,
  );
};

const convertRevolutCsvToCsv = async (path: string) => {
  const content = fs.readFileSync(path);
  const records = csv.parse(content, { columns: true });

  const transactions: Array<Array<string | number>> = [];

  await records.forEach((record) => {
    const id = md5("revolut" + record["Started Date"]);
    const date = moment(record["Started Date"]).format("YYYY-MM-DD HH:mm");

    transactions.push([
      id,
      date,
      record["Description"],
      record["Description"],
      record["Amount"],
      record["Currency"],
    ]);
  });

  const fileName = `REVOLUT_${new Date().toISOString()}`;

  csv.stringify(transactions, (err, output) => {
    {
      if (err) {
        console.error(err);
      } else {
        // Save the csv file to the import folder
        fs.writeFileSync(`${IMPORT_FOLDER}/${fileName}.csv`, output);
      }
    }
  });

  // Save the config with the same file name
  fs.copyFileSync(
    `${FIREFLY_CONFIG_DIR}/revolut.json`,
    `${IMPORT_FOLDER}/${fileName}.json`,
  );
};
