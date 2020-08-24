"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParkingTicket = exports.getLicencePlateExpiryDateFromPieces = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const configFns = require("../configFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.getLicencePlateExpiryDateFromPieces = (reqBody) => {
    let licencePlateExpiryDate = 0;
    const licencePlateExpiryYear = parseInt(reqBody.licencePlateExpiryYear, 10) || 0;
    const licencePlateExpiryMonth = parseInt(reqBody.licencePlateExpiryMonth, 10) || 0;
    if (licencePlateExpiryYear === 0 && licencePlateExpiryMonth === 0) {
        licencePlateExpiryDate = 0;
    }
    else if (licencePlateExpiryYear === 0 || licencePlateExpiryMonth === 0) {
        return {
            success: false,
            message: "The licence plate expiry date fields must both be blank or both be completed."
        };
    }
    else {
        const dateObj = new Date(licencePlateExpiryYear, (licencePlateExpiryMonth - 1) + 1, (1 - 1), 0, 0, 0, 0);
        licencePlateExpiryDate = dateTimeFns.dateToInteger(dateObj);
    }
    return {
        success: true,
        licencePlateExpiryDate
    };
};
exports.updateParkingTicket = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const nowMillis = Date.now();
    const issueDate = dateTimeFns.dateStringToInteger(reqBody.issueDateString);
    if (configFns.getProperty("parkingTickets.ticketNumber.isUnique")) {
        const duplicateTicket = db.prepare("select ticketID from ParkingTickets" +
            " where recordDelete_timeMillis is null" +
            " and ticketNumber = ?" +
            " and ticketID != ?" +
            " and abs(issueDate - ?) <= 20000")
            .get(reqBody.ticketNumber, reqBody.ticketID, issueDate);
        if (duplicateTicket) {
            db.close();
            return {
                success: false,
                message: "A ticket with the same ticket number was seen in the last two years."
            };
        }
    }
    let licencePlateExpiryDate = dateTimeFns.dateStringToInteger(reqBody.licencePlateExpiryDateString);
    if (!configFns.getProperty("parkingTickets.licencePlateExpiryDate.includeDay")) {
        const licencePlateExpiryDateReturn = exports.getLicencePlateExpiryDateFromPieces(reqBody);
        if (licencePlateExpiryDateReturn.success) {
            licencePlateExpiryDate = licencePlateExpiryDateReturn.licencePlateExpiryDate;
        }
        else {
            db.close();
            return {
                success: false,
                message: licencePlateExpiryDateReturn.message
            };
        }
    }
    const info = db.prepare("update ParkingTickets" +
        " set ticketNumber = ?," +
        " issueDate = ?," +
        " issueTime = ?," +
        " issuingOfficer = ?," +
        " locationKey = ?," +
        " locationDescription = ?," +
        " bylawNumber = ?," +
        " parkingOffence = ?," +
        " offenceAmount = ?," +
        " discountOffenceAmount = ?," +
        " discountDays = ?," +
        " licencePlateCountry = ?," +
        " licencePlateProvince = ?," +
        " licencePlateNumber = ?," +
        " licencePlateIsMissing = ?," +
        " licencePlateExpiryDate = ?," +
        " vehicleMakeModel = ?," +
        " vehicleVIN = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and resolvedDate is null" +
        " and recordDelete_timeMillis is null")
        .run(reqBody.ticketNumber, issueDate, dateTimeFns.timeStringToInteger(reqBody.issueTimeString), reqBody.issuingOfficer, reqBody.locationKey, reqBody.locationDescription, reqBody.bylawNumber, reqBody.parkingOffence, reqBody.offenceAmount, reqBody.discountOffenceAmount, reqBody.discountDays, reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber, (reqBody.licencePlateIsMissing ? 1 : 0), licencePlateExpiryDate, reqBody.vehicleMakeModel, reqBody.vehicleVIN, reqSession.user.userName, nowMillis, reqBody.ticketID);
    db.close();
    if (info.changes) {
        return {
            success: true
        };
    }
    else {
        return {
            success: false,
            message: "An error occurred saving this ticket.  Please try again."
        };
    }
};
