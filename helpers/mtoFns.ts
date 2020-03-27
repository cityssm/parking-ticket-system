import sqlite = require("better-sqlite3");
import { dbPath } from "./parkingDB";

import * as dateTimeFns from "./dateTimeFns";


let currentDateNumber: number;
let currentYearPrefix: number;


function resetCurrentDate() {
  const currentDate = new Date();
  currentDateNumber = dateTimeFns.dateToInteger(currentDate);
  currentYearPrefix = Math.floor(currentDate.getFullYear() / 100) * 1000000;
}


function sixDigitDateNumberToEightDigit(sixDigitDateNumber: number) {

  let eightDigitDateNumber = sixDigitDateNumber + currentYearPrefix;

  if (eightDigitDateNumber > currentDateNumber) {
    return eightDigitDateNumber - 1000000;
  }

  return eightDigitDateNumber;
}

function parsePKRA(rowData: string) {

  if (!rowData.startsWith("PKRA")) {
    return false;
  }

  /*
   * PKRA RECORD
   * -----------
   * Record ID    | 4 characters               | "PKRA"
   * DEST-CODE    | 4 characters               | "    "
   * BATCH-NO     | 1 character                | "1"
   * Sent Date    | 6 numbers                  | YYMMDD
   * Record Count | 6 numbers, right justified | "   201"
   * TAPE-NEEDED  | 1 character, Y or N        | Y
   * LABEL-NEEDED | 1 character, Y or N        | N
   * ENTRY-DATE   | 6 numbers                  | YYMMDD
   * Record Date  | 6 numbers                  | YYMMDD
   * FILLER       | 165 characters
   */

  const record = {
    sentDate: 0,
    recordDate: 0
  };

  const rawSentDate = rowData.substring(9, 15).trim();

  if (rawSentDate === "") {
    return false;
  }

  record.sentDate = sixDigitDateNumberToEightDigit(parseInt(rawSentDate));

  const rawRecordDate = rowData.substring(29, 35).trim();

  if (rawRecordDate === "") {
    return false;
  }

  record.recordDate = sixDigitDateNumberToEightDigit(parseInt(rawRecordDate));

  return record;
}


export function importLicencePlateOwnership(batchID: number, ownershipData: string) {

  const ownershipDataRows = ownershipData.split("\n");

  if (ownershipDataRows.length === 0) {
    return {
      success: false,
      message: "The file contains zero data rows."
    }
  }

  resetCurrentDate();

  const headerRow = parsePKRA(ownershipDataRows[0]);

  if (!headerRow) {
    return {
      success: false,
      message: "An error occurred while trying to parse the first row of the file."
    }
  }

  const db = sqlite(dbPath);



}
