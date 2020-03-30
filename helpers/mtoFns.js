"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("./parkingDB");
const dateTimeFns = require("./dateTimeFns");
let currentDate = new Date();
let currentDateNumber;
let currentDatePrefix;
let currentYearPrefix;
function resetCurrentDate() {
    currentDate = new Date();
    currentDateNumber = dateTimeFns.dateToInteger(currentDate);
    currentYearPrefix = Math.floor(currentDate.getFullYear() / 100) * 100;
    currentDatePrefix = currentYearPrefix * 10000;
}
function twoDigitYearToFourDigit(twoDigitYear) {
    let fourDigitYear = twoDigitYear + currentYearPrefix;
    if (fourDigitYear > currentDate.getFullYear() + 5) {
        return fourDigitYear - 100;
    }
    return fourDigitYear;
}
function sixDigitDateNumberToEightDigit(sixDigitDateNumber) {
    let eightDigitDateNumber = sixDigitDateNumber + currentDatePrefix;
    if (eightDigitDateNumber > currentDateNumber) {
        return eightDigitDateNumber - 1000000;
    }
    return eightDigitDateNumber;
}
function parsePKRA(rowData) {
    if (!rowData.startsWith("PKRA")) {
        return false;
    }
    try {
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
    catch (e) {
        return false;
    }
}
function parsePKRD(rowData) {
    if (!rowData.startsWith("PKRD")) {
        return false;
    }
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
        record.issueDate = sixDigitDateNumberToEightDigit(parseInt(rowData.substring(14, 20)));
        record.ticketNumber = rowData.substring(20, 28).trim();
        record.driverLicenceNumber = rowData.substring(32, 47).trim();
        record.ownerGenderKey = rowData.substring(53, 54);
        record.ownerName1 = rowData.substring(54, 104).trim();
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
        record.vehicleYear = twoDigitYearToFourDigit(parseInt(rowData.substring(154, 156)));
        record.vehicleColor = rowData.substring(166, 169).trim();
        record.errorCode = rowData.substring(169, 175).trim();
        record.errorMessage = rowData.substring(175, 204).trim();
        const expiryYear = twoDigitYearToFourDigit(parseInt(rowData.substring(204, 206)));
        const expiryDate = new Date(expiryYear, (parseInt(rowData.substring(206, 208)) - 1) + 1, 1);
        expiryDate.setDate(expiryDate.getDate() - 1);
        record.licencePlateExpiryDate = dateTimeFns.dateToInteger(expiryDate);
        if (record.errorCode !== "") {
            record.vehicleYear = 0;
            record.licencePlateExpiryDate = 0;
        }
        return record;
    }
    catch (e) {
        return false;
    }
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
    }
    else if (batchRow.sentDate !== headerRow.sentDate) {
        db.close();
        return {
            success: false,
            message: "The sent date in the batch record does not match the sent date in the file."
        };
    }
    for (let recordIndex = 1; recordIndex < ownershipDataRows.length - 1; recordIndex += 1) {
        const recordRow = parsePKRD(ownershipDataRows[recordIndex]);
        console.log(recordRow);
    }
}
exports.importLicencePlateOwnership = importLicencePlateOwnership;
