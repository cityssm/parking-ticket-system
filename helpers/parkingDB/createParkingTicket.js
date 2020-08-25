"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParkingTicket = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const configFns = require("../configFns");
const updateParkingTicket_1 = require("./updateParkingTicket");
const databasePaths_1 = require("../../data/databasePaths");
const hasDuplicateTicket = (db, ticketNumber, issueDate) => {
    const duplicateTicket = db.prepare("select ticketID from ParkingTickets" +
        " where recordDelete_timeMillis is null" +
        " and ticketNumber = ?" +
        " and abs(issueDate - ?) <= 20000")
        .get(ticketNumber, issueDate);
    if (duplicateTicket) {
        return true;
    }
    return false;
};
exports.createParkingTicket = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const nowMillis = Date.now();
    const issueDate = dateTimeFns.dateStringToInteger(reqBody.issueDateString);
    if (configFns.getProperty("parkingTickets.ticketNumber.isUnique")) {
        if (hasDuplicateTicket(db, reqBody.ticketNumber, issueDate)) {
            db.close();
            return {
                success: false,
                message: "A ticket with the same ticket number was seen in the last two years."
            };
        }
    }
    let licencePlateExpiryDate = dateTimeFns.dateStringToInteger(reqBody.licencePlateExpiryDateString);
    if (!configFns.getProperty("parkingTickets.licencePlateExpiryDate.includeDay")) {
        const licencePlateExpiryDateReturn = updateParkingTicket_1.getLicencePlateExpiryDateFromPieces(reqBody);
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
    const info = db.prepare("insert into ParkingTickets" +
        " (ticketNumber, issueDate, issueTime, issuingOfficer," +
        " locationKey, locationDescription," +
        " bylawNumber, parkingOffence, offenceAmount, discountOffenceAmount, discountDays," +
        " licencePlateCountry, licencePlateProvince, licencePlateNumber," +
        " licencePlateIsMissing, licencePlateExpiryDate, vehicleMakeModel, vehicleVIN," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.ticketNumber, issueDate, dateTimeFns.timeStringToInteger(reqBody.issueTimeString), reqBody.issuingOfficer, reqBody.locationKey, reqBody.locationDescription, reqBody.bylawNumber, reqBody.parkingOffence, reqBody.offenceAmount, reqBody.discountOffenceAmount, reqBody.discountDays, reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber, (reqBody.licencePlateIsMissing ? 1 : 0), licencePlateExpiryDate, reqBody.vehicleMakeModel, reqBody.vehicleVIN, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return {
        success: true,
        ticketID: info.lastInsertRowid,
        nextTicketNumber: ""
    };
};
