import * as sqlite from "better-sqlite3";
import * as parkingDB from "./parkingDB";

import * as configFns from "./configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";


let currentDate = new Date();
let currentDateNumber: number;
let currentDatePrefix: number;
let currentYearPrefix: number;


function resetCurrentDate() {
  currentDate = new Date();
  currentDateNumber = dateTimeFns.dateToInteger(currentDate);

  currentYearPrefix = Math.floor(currentDate.getFullYear() / 100) * 100;
  currentDatePrefix = currentYearPrefix * 10000;
}


function twoDigitYearToFourDigit(twoDigitYear: number) {

  let fourDigitYear = twoDigitYear + currentYearPrefix;

  if (fourDigitYear > currentDate.getFullYear() + 5) {
    return fourDigitYear - 100;
  }

  return fourDigitYear;
}


function sixDigitDateNumberToEightDigit(sixDigitDateNumber: number) {

  let eightDigitDateNumber = sixDigitDateNumber + currentDatePrefix;

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


  try {
    const record = {
      sentDate: 0,
      recordDate: 0
    };

    const rawSentDate = rowData.substring(9, 15).trim();

    if (rawSentDate === "") {
      return false;
    }

    record.sentDate = sixDigitDateNumberToEightDigit(parseInt(rawSentDate, 10));

    const rawRecordDate = rowData.substring(29, 35).trim();

    if (rawRecordDate === "") {
      return false;
    }

    record.recordDate = sixDigitDateNumberToEightDigit(parseInt(rawRecordDate, 10));

    return record;
  }
  catch (e) {
    return false;
  }
}


function parsePKRD(rowData: string) {

  if (!rowData.startsWith("PKRD")) {
    return false;
  }

  /*
   * PKRD RECORD
   * -----------
   * Record ID                 | 4 characters                  | "PKRD"
   * Licence Plate Number      | 10 characters                 | "XXXX111   "
   * Issue Date                | 6 numbers                     | YYMMDD
   * Ticket Number             | 8 characters                  | "XX00000 "
   * INPUT-MAKE                | 4 characters                  |
   * Driver's Licence Number   | 15 characters                 | "A12345123451234"
   * Birth Date                | 6 numbers                     | YYMMDD
   * Gender                    | 1 character                   | M
   * Owner's Name              | 50 characters, "/" separated  | "DOE,JOHN/DOE,JANE                                 "
   * Address                   | 40 characters, including city | "1234 STREET RD,S STE MARIE             "
   * Postal Code               | 6 characters                  | "A1A1A1"
   * Vehicle NCIC              | 4 characters                  | "CHEV"
   * Vehicle Year              | 2 numbers                     | "17"
   * Odometer Reading          | 8 numbers                     | "123456  "
   * Odometer Unit             | 2 characters                  | "KM"
   * Vehicle Colour            | 3 characters                  | "BLK"
   * Error Code                | 6 characters                  | "WRN262"
   * Error Message             | 29 characters                 | "PLATE WAS UNATTACHED         "
   * Licence Plate Expiry Date | 4 numbers                     | YYMM
   * BRAND                     | 3 characters
   * FILLER                    | 10 characters
   */

  try {

    const record = {
      licencePlateNumber: "",
      issueDate: 0,
      ticketNumber: "",

      driverLicenceNumber: "",

      ownerGenderKey: "",

      ownerName1: "",
      ownerName2: "",
      ownerAddress: "",
      ownerCity: "",
      ownerProvince: "ON",
      ownerPostalCode: "",

      vehicleNCIC: "",
      vehicleYear: 0,
      vehicleColor: "",

      errorCode: "",
      errorMessage: "",

      licencePlateExpiryDate: 0
    };

    record.licencePlateNumber = rowData.substring(4, 14).trim();
    record.issueDate = sixDigitDateNumberToEightDigit(parseInt(rowData.substring(14, 20), 10));
    record.ticketNumber = rowData.substring(20, 28).trim();

    record.driverLicenceNumber = rowData.substring(32, 47).trim();

    record.ownerGenderKey = rowData.substring(53, 54);

    record.ownerName1 = rowData.substring(54, 104).replace(/,/g, ", ").trim();

    if (record.ownerName1.indexOf("/") !== -1) {

      const slashIndex = record.ownerName1.indexOf("/");

      record.ownerName2 = record.ownerName1.substring(slashIndex + 1);
      record.ownerName1 = record.ownerName1.substring(0, slashIndex);
    }

    record.ownerAddress = rowData.substring(104, 144).trim();

    if (record.ownerAddress.indexOf(",") !== -1) {

      const lastCommaIndex = record.ownerAddress.lastIndexOf(",");

      record.ownerCity = record.ownerAddress.substring(lastCommaIndex + 1);
      record.ownerAddress = record.ownerAddress.substring(0, lastCommaIndex);

      if (record.ownerCity === "S STE MARIE") {
        record.ownerCity = "SAULT STE. MARIE";
      }
    }

    record.ownerPostalCode = rowData.substring(144, 150).trim();

    record.vehicleNCIC = rowData.substring(150, 154).trim();

    record.vehicleYear = twoDigitYearToFourDigit(parseInt(rowData.substring(154, 156), 10));

    record.vehicleColor = rowData.substring(166, 169).trim();

    record.errorCode = rowData.substring(169, 175).trim();
    record.errorMessage = rowData.substring(175, 204).trim();

    const expiryYear = twoDigitYearToFourDigit(parseInt(rowData.substring(204, 206), 10));

    const expiryDate = new Date(expiryYear, (parseInt(rowData.substring(206, 208), 10) - 1) + 1, 1);
    expiryDate.setDate(expiryDate.getDate() - 1);

    record.licencePlateExpiryDate = dateTimeFns.dateToInteger(expiryDate);

    if (record.errorCode !== "") {
      record.vehicleYear = 0;
      record.licencePlateExpiryDate = 0;
    }

    return record;

  } catch (e) {
    return false;
  }


}


export function importLicencePlateOwnership(batchID: number, ownershipData: string, reqSession: Express.Session) {

  // Split the file into rows

  const ownershipDataRows = ownershipData.split("\n");

  if (ownershipDataRows.length === 0) {
    return {
      success: false,
      message: "The file contains zero data rows."
    }
  }

  // Parse the first row

  resetCurrentDate();

  const headerRow = parsePKRA(ownershipDataRows[0]);

  if (!headerRow) {
    return {
      success: false,
      message: "An error occurred while trying to parse the first row of the file."
    }
  }

  // Verify the batch with the sent date in the file

  const db = sqlite(parkingDB.dbPath);

  const batchRow = db.prepare("select sentDate from LicencePlateLookupBatches" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is not null" +
    " and sentDate is not null")
    .get(batchID);

  if (!batchRow) {

    db.close();

    return {
      success: false,
      message: "Batch #" + batchID + " is unavailable for imports."
    };

  } else if (batchRow.sentDate !== headerRow.sentDate) {

    db.close();

    return {
      success: false,
      message: "The sent date in the batch record does not match the sent date in the file."
    };

  }

  db.prepare("delete from LicencePlateLookupErrorLog" +
    " where batchID = ?")
    .run(batchID);

  // Look through record rows

  let rowCount = 0;

  let errorCount = 0;
  let insertedErrorCount = 0;

  let recordCount = 0;
  let insertedRecordCount = 0;

  const rightNowMillis = Date.now();

  for (let recordIndex = 1; recordIndex < ownershipDataRows.length - 1; recordIndex += 1) {

    const recordRow = parsePKRD(ownershipDataRows[recordIndex]);

    if (recordRow) {

      rowCount += 1;

      if (recordRow.errorCode !== "") {

        errorCount += 1;

        insertedErrorCount += db.prepare("insert or ignore into LicencePlateLookupErrorLog (" +
          "batchID, logIndex," +
          " licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDate," +
          " errorCode, errorMessage," +
          " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
          " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .run(batchID, errorCount,
            "CA", "ON", recordRow.licencePlateNumber, headerRow.recordDate,
            recordRow.errorCode, recordRow.errorMessage,
            reqSession.user.userName, rightNowMillis,
            reqSession.user.userName, rightNowMillis
          ).changes;

      }

      if (recordRow.ownerName1 !== "") {

        recordCount += 1;

        insertedRecordCount += db.prepare("insert or ignore into LicencePlateOwners (" +
          "licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDate," +
          " vehicleNCIC, vehicleYear, vehicleColor, licencePlateExpiryDate," +
          " ownerName1, ownerName2," +
          " ownerAddress, ownerCity, ownerProvince, ownerPostalCode, ownerGenderKey," +
          " driverLicenceNumber," +
          " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
          " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .run("CA", "ON", recordRow.licencePlateNumber, headerRow.recordDate,
            recordRow.vehicleNCIC, recordRow.vehicleYear, recordRow.vehicleColor,
            recordRow.licencePlateExpiryDate,
            recordRow.ownerName1, recordRow.ownerName2,
            recordRow.ownerAddress, recordRow.ownerCity, recordRow.ownerProvince, recordRow.ownerPostalCode, recordRow.ownerGenderKey,
            recordRow.driverLicenceNumber,
            reqSession.user.userName, rightNowMillis,
            reqSession.user.userName, rightNowMillis
          ).changes;

      }

    }

  }

  // Update batch

  db.prepare("update LicencePlateLookupBatches" +
    " set receivedDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?")
    .run(headerRow.recordDate,
      reqSession.user.userName,
      rightNowMillis,
      batchID);

  db.close();

  return {
    success: true,
    rowCount: rowCount,
    errorCount: errorCount,
    insertedErrorCount: insertedErrorCount,
    recordCount: recordCount,
    insertedRecordCount: insertedRecordCount

  }
}


function exportBatch(sentDate: number, batchEntries: {
  ticketID?: number,
  ticketNumber?: string,
  issueDate?: number,
  licencePlateNumber?: string
}[]) {

  const newline = "\n";

  let output = "";

  let recordCount = 0;

  /*
   * RECORD ROWS
   * -----------
   * Record ID       | 4 characters  | "PKTD"
   * Plate Number    | 10 characters | "XXXX111   "
   * Issue Date      | 6 numbers     | YYMMDD
   * Ticket Number   | 23 characters | "XX00000                  "
   * Authorized User | 4 characters  | "XX00"
   */

  const authorizedUserPadded = (configFns.getProperty("mtoExportImport.authorizedUser") + "    ").substring(0, 4);

  for (let index = 0; index < batchEntries.length; index += 1) {

    const entry = batchEntries[index];

    if (entry.ticketID === null) {
      continue;
    }

    recordCount += 1;

    output += "PKTD" +
      (entry.licencePlateNumber + "          ").substring(0, 10) +
      entry.issueDate.toString().slice(-6) +
      (entry.ticketNumber + "                       ").substring(0, 23) +
      authorizedUserPadded + newline;
  }

  const recordCountPadded = ("000000" + recordCount.toString()).slice(-6);

  /*
   * HEADER ROW
   * ----------
   * Record ID    | 4 characters           | "PKTA"
   * Unknown      | 5 characters           | "    1"
   * Export Date  | 6 numbers              | YYMMDD
   * Record Count | 6 numbers, zero padded | 000201
   * RET-TAPE     | 1 character, Y or N    | Y
   * CERT-LABEL   | 1 character, Y or N    | N
   */

  output = "PKTA" +
    "    1" +
    sentDate.toString().slice(-6) +
    recordCountPadded +
    "Y" +
    "N" + newline +
    output;

  /*
   * FOOTER ROW
   * ----------
   * Record ID    | 4 characters           | "PKTZ"
   * Record Count | 6 numbers, zero padded | 000201
   */

  output += "PKTZ" +
    recordCountPadded + newline;

  return output;
}


export function exportLicencePlateBatch(batchID: number, reqSession: Express.Session) {

  parkingDB.markLookupBatchAsSent(batchID, reqSession);

  const batch = parkingDB.getLicencePlateLookupBatch(batchID);

  return exportBatch(batch.sentDate, batch.batchEntries);
}


export function exportConvictionBatch(batchID: number, reqSession: Express.Session) {

  parkingDB.markConvictionBatchAsSent(batchID, reqSession);

  const batch = parkingDB.getParkingTicketConvictionBatch(batchID);

  return exportBatch(batch.sentDate, batch.batchEntries);
}
