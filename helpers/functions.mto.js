import * as dateTimeFns from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../data/databasePaths.js';
import getLookupBatch from '../database/parkingDB/getLookupBatch.js';
import { markLookupBatchAsSent } from '../database/parkingDB/markLookupBatchAsSent.js';
import { getConfigProperty } from './functions.config.js';
let currentDate;
let currentDateNumber;
let currentDatePrefix;
let currentYearPrefix;
function resetCurrentDate() {
    currentDate = new Date();
    currentDateNumber = dateTimeFns.dateToInteger(currentDate);
    currentYearPrefix = Math.floor(currentDate.getFullYear() / 100) * 100;
    currentDatePrefix = currentYearPrefix * 10000;
}
resetCurrentDate();
export function twoDigitYearToFourDigit(twoDigitYear) {
    const fourDigitYear = twoDigitYear + currentYearPrefix;
    if (fourDigitYear > currentDate.getFullYear() + 10) {
        return fourDigitYear - 100;
    }
    else if (currentDate.getFullYear() - fourDigitYear > 60) {
        return fourDigitYear + 100;
    }
    return fourDigitYear;
}
export function sixDigitDateNumberToEightDigit(sixDigitDateNumber) {
    const eightDigitDateNumber = sixDigitDateNumber + currentDatePrefix;
    if (eightDigitDateNumber > currentDateNumber) {
        return eightDigitDateNumber - 1000000;
    }
    return eightDigitDateNumber;
}
function parsePKRA(rowData) {
    if (!rowData.startsWith('PKRA')) {
        return false;
    }
    try {
        const record = {
            sentDate: 0,
            recordDate: 0
        };
        const rawSentDate = rowData.slice(9, 15).trim();
        if (rawSentDate === '') {
            return false;
        }
        record.sentDate = sixDigitDateNumberToEightDigit(Number.parseInt(rawSentDate, 10));
        const rawRecordDate = rowData.slice(29, 35).trim();
        if (rawRecordDate === '') {
            return false;
        }
        record.recordDate = sixDigitDateNumberToEightDigit(Number.parseInt(rawRecordDate, 10));
        return record;
    }
    catch {
        return false;
    }
}
export const parsePKRD = (rowData) => {
    if (!rowData.startsWith('PKRD')) {
        return false;
    }
    try {
        const record = {
            licencePlateNumber: '',
            issueDate: 0,
            ticketNumber: '',
            driverLicenceNumber: '',
            ownerGenderKey: '',
            ownerName1: '',
            ownerName2: '',
            ownerAddress: '',
            ownerCity: '',
            ownerProvince: 'ON',
            ownerPostalCode: '',
            vehicleNCIC: '',
            vehicleYear: 0,
            vehicleColor: '',
            errorCode: '',
            errorMessage: '',
            licencePlateExpiryDate: 0
        };
        record.licencePlateNumber = rowData.slice(4, 14).trim();
        record.issueDate = sixDigitDateNumberToEightDigit(Number.parseInt(rowData.slice(14, 20), 10));
        record.ticketNumber = rowData.slice(20, 28).trim();
        record.driverLicenceNumber = rowData.slice(32, 47).trim();
        record.ownerGenderKey = rowData.slice(53, 54);
        record.ownerName1 = rowData.slice(54, 104).replaceAll(',', ', ').trim();
        if (record.ownerName1.includes('/')) {
            const slashIndex = record.ownerName1.indexOf('/');
            record.ownerName2 = record.ownerName1.slice(Math.max(0, slashIndex + 1));
            record.ownerName1 = record.ownerName1.slice(0, Math.max(0, slashIndex));
        }
        record.ownerAddress = rowData.slice(104, 144).trim();
        if (record.ownerAddress.includes(',')) {
            const lastCommaIndex = record.ownerAddress.lastIndexOf(',');
            record.ownerCity = record.ownerAddress.slice(Math.max(0, lastCommaIndex + 1));
            record.ownerAddress = record.ownerAddress.slice(0, Math.max(0, lastCommaIndex));
            if (record.ownerCity === 'S STE MARIE') {
                record.ownerCity = 'SAULT STE. MARIE';
            }
        }
        record.ownerPostalCode = rowData.slice(144, 150).trim();
        record.vehicleNCIC = rowData.slice(150, 154).trim();
        record.vehicleYear = twoDigitYearToFourDigit(Number.parseInt(rowData.slice(154, 156), 10));
        record.vehicleColor = rowData.slice(166, 169).trim();
        record.errorCode = rowData.slice(169, 175).trim();
        record.errorMessage = rowData.slice(175, 204).trim();
        const expiryYear = twoDigitYearToFourDigit(Number.parseInt(rowData.slice(204, 206), 10));
        const expiryDate = new Date(expiryYear, Number.parseInt(rowData.slice(206, 208), 10) - 1 + 1, 1);
        expiryDate.setDate(expiryDate.getDate() - 1);
        record.licencePlateExpiryDate = dateTimeFns.dateToInteger(expiryDate);
        if (record.errorCode !== '') {
            record.vehicleYear = 0;
            record.licencePlateExpiryDate = 0;
        }
        return record;
    }
    catch {
        return false;
    }
};
export const importLicencePlateOwnership = (batchId, ownershipData, sessionUser) => {
    const ownershipDataRows = ownershipData.split('\n');
    if (ownershipDataRows.length === 0) {
        return {
            success: false,
            message: 'The file contains zero data rows.'
        };
    }
    resetCurrentDate();
    const headerRow = parsePKRA(ownershipDataRows[0]);
    if (!headerRow) {
        return {
            success: false,
            message: 'An error occurred while trying to parse the first row of the file.'
        };
    }
    const database = sqlite(databasePath);
    const batchRow = database
        .prepare(`select sentDate from LicencePlateLookupBatches
        where batchId = ?
        and recordDelete_timeMillis is null
        and lockDate is not null
        and sentDate is not null`)
        .get(batchId);
    if (batchRow === undefined) {
        database.close();
        return {
            success: false,
            message: `Batch #${batchId.toString()} is unavailable for imports.`
        };
    }
    else if (batchRow.sentDate !== headerRow.sentDate) {
        database.close();
        return {
            success: false,
            message: 'The sent date in the batch record does not match the sent date in the file.'
        };
    }
    database
        .prepare('delete from LicencePlateLookupErrorLog where batchId = ?')
        .run(batchId);
    let rowCount = 0;
    let errorCount = 0;
    let insertedErrorCount = 0;
    let recordCount = 0;
    let insertedRecordCount = 0;
    const rightNowMillis = Date.now();
    for (const ownershipDataRow of ownershipDataRows) {
        const recordRow = parsePKRD(ownershipDataRow);
        if (recordRow) {
            rowCount += 1;
            if (recordRow.errorCode !== '') {
                errorCount += 1;
                insertedErrorCount += database
                    .prepare(`insert or ignore into LicencePlateLookupErrorLog (
              batchId, logIndex, licencePlateCountry, licencePlateProvince, licencePlateNumber,
              recordDate, errorCode, errorMessage,
              recordCreate_userName, recordCreate_timeMillis,
              recordUpdate_userName, recordUpdate_timeMillis) 
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                    .run(batchId, errorCount, 'CA', 'ON', recordRow.licencePlateNumber, headerRow.recordDate, recordRow.errorCode, recordRow.errorMessage, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis).changes;
            }
            if (recordRow.ownerName1 !== '') {
                recordCount += 1;
                insertedRecordCount += database
                    .prepare(`insert or ignore into LicencePlateOwners (
              licencePlateCountry, licencePlateProvince, licencePlateNumber,
              recordDate, vehicleNCIC, vehicleYear, vehicleColor, licencePlateExpiryDate,
              ownerName1, ownerName2, ownerAddress, ownerCity, ownerProvince, ownerPostalCode, ownerGenderKey,
              driverLicenceNumber,
              recordCreate_userName, recordCreate_timeMillis,
              recordUpdate_userName, recordUpdate_timeMillis)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                    .run('CA', 'ON', recordRow.licencePlateNumber, headerRow.recordDate, recordRow.vehicleNCIC, recordRow.vehicleYear, recordRow.vehicleColor, recordRow.licencePlateExpiryDate, recordRow.ownerName1, recordRow.ownerName2, recordRow.ownerAddress, recordRow.ownerCity, recordRow.ownerProvince, recordRow.ownerPostalCode, recordRow.ownerGenderKey, recordRow.driverLicenceNumber, sessionUser.userName, rightNowMillis, sessionUser.userName, rightNowMillis).changes;
            }
        }
    }
    database
        .prepare(`update LicencePlateLookupBatches
        set receivedDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchId = ?`)
        .run(headerRow.recordDate, sessionUser.userName, rightNowMillis, batchId);
    database.close();
    return {
        success: true,
        rowCount,
        errorCount,
        insertedErrorCount,
        recordCount,
        insertedRecordCount
    };
};
function exportBatch(sentDate, includeLabels, batchEntries) {
    const newline = '\n';
    let output = '';
    let recordCount = 0;
    const authorizedUserPadded = (getConfigProperty('mtoExportImport.authorizedUser') + '    ').slice(0, 4);
    for (const entry of batchEntries) {
        if (entry.ticketId === null) {
            continue;
        }
        recordCount += 1;
        output +=
            'PKTD' +
                entry.licencePlateNumber?.padEnd(10).slice(0, 10) +
                entry.issueDate?.toString().slice(-6) +
                entry.ticketNumber?.padEnd(23, ' ').slice(0, 23) +
                authorizedUserPadded +
                newline;
    }
    const recordCountPadded = ('000000' + recordCount.toString()).slice(-6);
    output =
        'PKTA' +
            '    1' +
            sentDate.toString().slice(-6) +
            recordCountPadded +
            'Y' +
            (includeLabels ? 'Y' : 'N') +
            newline +
            output;
    output += 'PKTZ' + recordCountPadded + newline;
    return output;
}
export function exportLicencePlateBatch(batchId, sessionUser) {
    markLookupBatchAsSent(batchId, sessionUser);
    const batch = getLookupBatch(batchId);
    return exportBatch(batch.sentDate, batch.mto_includeLabels, batch.batchEntries);
}
