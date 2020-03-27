"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("./parkingDB");
const dateTimeFns = require("./dateTimeFns");
let currentDateNumber;
let currentYearPrefix;
function resetCurrentDate() {
    const currentDate = new Date();
    currentDateNumber = dateTimeFns.dateToInteger(currentDate);
    currentYearPrefix = Math.floor(currentDate.getFullYear() / 100) * 1000000;
}
function sixDigitDateNumberToEightDigit(sixDigitDateNumber) {
    let eightDigitDateNumber = sixDigitDateNumber + currentYearPrefix;
    if (eightDigitDateNumber > currentDateNumber) {
        return eightDigitDateNumber - 1000000;
    }
    return eightDigitDateNumber;
}
function parsePKRA(rowData) {
    if (!rowData.startsWith("PKRA")) {
        return false;
    }
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
function importLicencePlateOwnership(batchID, ownershipData) {
    const ownershipDataRows = ownershipData.split("\n");
    if (ownershipDataRows.length === 0) {
        return {
            success: false,
            message: "The file contains zero data rows."
        };
    }
    resetCurrentDate();
    const headerRow = parsePKRA(ownershipDataRows[0]);
    if (!headerRow) {
        return {
            success: false,
            message: "An error occurred while trying to parse the first row of the file."
        };
    }
    const db = sqlite(parkingDB_1.dbPath);
}
exports.importLicencePlateOwnership = importLicencePlateOwnership;
