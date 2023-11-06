import * as dateTimeFns from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import * as configFunctions from '../../helpers/functions.config.js';
export const getLicencePlateExpiryDateFromPieces = (requestBody) => {
    let licencePlateExpiryDate = 0;
    const licencePlateExpiryYear = Number.parseInt(requestBody.licencePlateExpiryYear, 10) ?? 0;
    const licencePlateExpiryMonth = Number.parseInt(requestBody.licencePlateExpiryMonth, 10) ?? 0;
    if (licencePlateExpiryYear === 0 && licencePlateExpiryMonth === 0) {
        licencePlateExpiryDate = 0;
    }
    else if (licencePlateExpiryYear === 0 || licencePlateExpiryMonth === 0) {
        return {
            success: false,
            message: 'The licence plate expiry date fields must both be blank or both be completed.'
        };
    }
    else {
        const dateObject = new Date(licencePlateExpiryYear, licencePlateExpiryMonth - 1 + 1, 1 - 1, 0, 0, 0, 0);
        licencePlateExpiryDate = dateTimeFns.dateToInteger(dateObject);
    }
    return {
        success: true,
        licencePlateExpiryDate
    };
};
export const updateParkingTicket = (requestBody, sessionUser) => {
    const database = sqlite(databasePath);
    const nowMillis = Date.now();
    const issueDate = dateTimeFns.dateStringToInteger(requestBody.issueDateString);
    if (configFunctions.getProperty('parkingTickets.ticketNumber.isUnique')) {
        const duplicateTicket = database
            .prepare(`select ticketID from ParkingTickets
          where recordDelete_timeMillis is null
          and ticketNumber = ?
          and ticketID != ?
          and abs(issueDate - ?) <= 20000`)
            .get(requestBody.ticketNumber, requestBody.ticketID, issueDate);
        if (duplicateTicket) {
            database.close();
            return {
                success: false,
                message: 'A ticket with the same ticket number was seen in the last two years.'
            };
        }
    }
    let licencePlateExpiryDate;
    if (configFunctions.getProperty('parkingTickets.licencePlateExpiryDate.includeDay')) {
        licencePlateExpiryDate =
            requestBody.licencePlateExpiryDateString === ''
                ? undefined
                : dateTimeFns.dateStringToInteger(requestBody.licencePlateExpiryDateString);
    }
    else {
        const licencePlateExpiryDateReturn = getLicencePlateExpiryDateFromPieces(requestBody);
        if (licencePlateExpiryDateReturn.success) {
            licencePlateExpiryDate =
                licencePlateExpiryDateReturn.licencePlateExpiryDate;
        }
        else {
            database.close();
            return {
                success: false,
                message: licencePlateExpiryDateReturn.message
            };
        }
    }
    const info = database
        .prepare(`update ParkingTickets
        set ticketNumber = ?,
        issueDate = ?,
        issueTime = ?,
        issuingOfficer = ?,
        locationKey = ?,
        locationDescription = ?,
        bylawNumber = ?,
        parkingOffence = ?,
        offenceAmount = ?,
        discountOffenceAmount = ?,
        discountDays = ?,
        licencePlateCountry = ?,
        licencePlateProvince = ?,
        licencePlateNumber = ?,
        licencePlateIsMissing = ?,
        licencePlateExpiryDate = ?,
        vehicleMakeModel = ?,
        vehicleVIN = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where ticketID = ?
        and resolvedDate is null
        and recordDelete_timeMillis is null`)
        .run(requestBody.ticketNumber, issueDate, dateTimeFns.timeStringToInteger(requestBody.issueTimeString), requestBody.issuingOfficer, requestBody.locationKey, requestBody.locationDescription, requestBody.bylawNumber, requestBody.parkingOffence, requestBody.offenceAmount, requestBody.discountOffenceAmount, requestBody.discountDays, requestBody.licencePlateCountry, requestBody.licencePlateProvince, requestBody.licencePlateNumber, requestBody.licencePlateIsMissing ? 1 : 0, licencePlateExpiryDate, requestBody.vehicleMakeModel, requestBody.vehicleVIN, sessionUser.userName, nowMillis, requestBody.ticketID);
    database.close();
    return info.changes > 0
        ? {
            success: true
        }
        : {
            success: false,
            message: 'An error occurred saving this ticket.  Please try again.'
        };
};
export default updateParkingTicket;
