"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportConvictionBatch = exports.exportLicencePlateBatch = exports.importLicencePlateOwnership = exports.parsePKRD = exports.sixDigitDateNumberToEightDigit = exports.twoDigitYearToFourDigit = void 0;
const sqlite = require("better-sqlite3");
const parkingDB = require("./parkingDB");
const parkingDB_getConvictionBatch = require("./parkingDB/getConvictionBatch");
const parkingDB_markConvictionBatchAsSent = require("./parkingDB/markConvictionBatchAsSent");
const parkingDB_getLookupBatch = require("./parkingDB/getLookupBatch");
const parkingDB_markLookupBatchAsSent = require("./parkingDB/markLookupBatchAsSent");
const configFns = require("./configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
let currentDate;
let currentDateNumber;
let currentDatePrefix;
let currentYearPrefix;
const resetCurrentDate = () => {
    currentDate = new Date();
    currentDateNumber = dateTimeFns.dateToInteger(currentDate);
    currentYearPrefix = Math.floor(currentDate.getFullYear() / 100) * 100;
    currentDatePrefix = currentYearPrefix * 10000;
};
resetCurrentDate();
exports.twoDigitYearToFourDigit = (twoDigitYear) => {
    const fourDigitYear = twoDigitYear + currentYearPrefix;
    if (fourDigitYear > currentDate.getFullYear() + 10) {
        return fourDigitYear - 100;
    }
    else if (currentDate.getFullYear() - fourDigitYear > 60) {
        return fourDigitYear + 100;
    }
    return fourDigitYear;
};
exports.sixDigitDateNumberToEightDigit = (sixDigitDateNumber) => {
    const eightDigitDateNumber = sixDigitDateNumber + currentDatePrefix;
    if (eightDigitDateNumber > currentDateNumber) {
        return eightDigitDateNumber - 1000000;
    }
    return eightDigitDateNumber;
};
const parsePKRA = (rowData) => {
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
        record.sentDate = exports.sixDigitDateNumberToEightDigit(parseInt(rawSentDate, 10));
        const rawRecordDate = rowData.substring(29, 35).trim();
        if (rawRecordDate === "") {
            return false;
        }
        record.recordDate = exports.sixDigitDateNumberToEightDigit(parseInt(rawRecordDate, 10));
        return record;
    }
    catch (e) {
        return false;
    }
};
exports.parsePKRD = (rowData) => {
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
        record.issueDate = exports.sixDigitDateNumberToEightDigit(parseInt(rowData.substring(14, 20), 10));
        record.ticketNumber = rowData.substring(20, 28).trim();
        record.driverLicenceNumber = rowData.substring(32, 47).trim();
        record.ownerGenderKey = rowData.substring(53, 54);
        record.ownerName1 = rowData.substring(54, 104).replace(/,/g, ", ").trim();
        if (record.ownerName1.includes("/")) {
            const slashIndex = record.ownerName1.indexOf("/");
            record.ownerName2 = record.ownerName1.substring(slashIndex + 1);
            record.ownerName1 = record.ownerName1.substring(0, slashIndex);
        }
        record.ownerAddress = rowData.substring(104, 144).trim();
        if (record.ownerAddress.includes(",")) {
            const lastCommaIndex = record.ownerAddress.lastIndexOf(",");
            record.ownerCity = record.ownerAddress.substring(lastCommaIndex + 1);
            record.ownerAddress = record.ownerAddress.substring(0, lastCommaIndex);
            if (record.ownerCity === "S STE MARIE") {
                record.ownerCity = "SAULT STE. MARIE";
            }
        }
        record.ownerPostalCode = rowData.substring(144, 150).trim();
        record.vehicleNCIC = rowData.substring(150, 154).trim();
        record.vehicleYear = exports.twoDigitYearToFourDigit(parseInt(rowData.substring(154, 156), 10));
        record.vehicleColor = rowData.substring(166, 169).trim();
        record.errorCode = rowData.substring(169, 175).trim();
        record.errorMessage = rowData.substring(175, 204).trim();
        const expiryYear = exports.twoDigitYearToFourDigit(parseInt(rowData.substring(204, 206), 10));
        const expiryDate = new Date(expiryYear, (parseInt(rowData.substring(206, 208), 10) - 1) + 1, 1);
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
};
exports.importLicencePlateOwnership = (batchID, ownershipData, reqSession) => {
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
            message: "Batch #" + batchID.toString() + " is unavailable for imports."
        };
    }
    else if (batchRow.sentDate !== headerRow.sentDate) {
        db.close();
        return {
            success: false,
            message: "The sent date in the batch record does not match the sent date in the file."
        };
    }
    db.prepare("delete from LicencePlateLookupErrorLog" +
        " where batchID = ?")
        .run(batchID);
    let rowCount = 0;
    let errorCount = 0;
    let insertedErrorCount = 0;
    let recordCount = 0;
    let insertedRecordCount = 0;
    const rightNowMillis = Date.now();
    for (const ownershipDataRow of ownershipDataRows) {
        const recordRow = exports.parsePKRD(ownershipDataRow);
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
                    .run(batchID, errorCount, "CA", "ON", recordRow.licencePlateNumber, headerRow.recordDate, recordRow.errorCode, recordRow.errorMessage, reqSession.user.userName, rightNowMillis, reqSession.user.userName, rightNowMillis).changes;
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
                    .run("CA", "ON", recordRow.licencePlateNumber, headerRow.recordDate, recordRow.vehicleNCIC, recordRow.vehicleYear, recordRow.vehicleColor, recordRow.licencePlateExpiryDate, recordRow.ownerName1, recordRow.ownerName2, recordRow.ownerAddress, recordRow.ownerCity, recordRow.ownerProvince, recordRow.ownerPostalCode, recordRow.ownerGenderKey, recordRow.driverLicenceNumber, reqSession.user.userName, rightNowMillis, reqSession.user.userName, rightNowMillis).changes;
            }
        }
    }
    db.prepare("update LicencePlateLookupBatches" +
        " set receivedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?")
        .run(headerRow.recordDate, reqSession.user.userName, rightNowMillis, batchID);
    db.close();
    return {
        success: true,
        rowCount,
        errorCount,
        insertedErrorCount,
        recordCount,
        insertedRecordCount
    };
};
const exportBatch = (sentDate, batchEntries) => {
    const newline = "\n";
    let output = "";
    let recordCount = 0;
    const authorizedUserPadded = (configFns.getProperty("mtoExportImport.authorizedUser") + "    ").substring(0, 4);
    for (const entry of batchEntries) {
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
    output = "PKTA" +
        "    1" +
        sentDate.toString().slice(-6) +
        recordCountPadded +
        "Y" +
        "N" + newline +
        output;
    output += "PKTZ" +
        recordCountPadded + newline;
    return output;
};
exports.exportLicencePlateBatch = (batchID, reqSession) => {
    parkingDB_markLookupBatchAsSent.markLookupBatchAsSent(batchID, reqSession);
    const batch = parkingDB_getLookupBatch.getLookupBatch(batchID);
    return exportBatch(batch.sentDate, batch.batchEntries);
};
exports.exportConvictionBatch = (batchID, reqSession) => {
    parkingDB_markConvictionBatchAsSent.markConvictionBatchAsSent(batchID, reqSession);
    const batch = parkingDB_getConvictionBatch.getConvictionBatch(batchID);
    return exportBatch(batch.sentDate, batch.batchEntries);
};
