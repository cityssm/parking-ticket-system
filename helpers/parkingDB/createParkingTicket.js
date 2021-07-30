import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFunctions from "../functions.config.js";
import { intLikeToNumber } from "../functions.database.js";
import { getLicencePlateExpiryDateFromPieces } from "./updateParkingTicket.js";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
const hasDuplicateTicket = (database, ticketNumber, issueDate) => {
    const duplicateTicket = database.prepare("select ticketID from ParkingTickets" +
        " where recordDelete_timeMillis is null" +
        " and ticketNumber = ?" +
        " and abs(issueDate - ?) <= 20000")
        .get(ticketNumber, issueDate);
    if (duplicateTicket) {
        return true;
    }
    return false;
};
export const createParkingTicket = (requestBody, requestSession) => {
    const database = sqlite(databasePath);
    const nowMillis = Date.now();
    const issueDate = dateTimeFns.dateStringToInteger(requestBody.issueDateString);
    if (configFunctions.getProperty("parkingTickets.ticketNumber.isUnique") &&
        hasDuplicateTicket(database, requestBody.ticketNumber, issueDate)) {
        database.close();
        return {
            success: false,
            message: "A ticket with the same ticket number was seen in the last two years."
        };
    }
    let licencePlateExpiryDate = dateTimeFns.dateStringToInteger(requestBody.licencePlateExpiryDateString);
    if (!configFunctions.getProperty("parkingTickets.licencePlateExpiryDate.includeDay")) {
        const licencePlateExpiryDateReturn = getLicencePlateExpiryDateFromPieces(requestBody);
        if (licencePlateExpiryDateReturn.success) {
            licencePlateExpiryDate = licencePlateExpiryDateReturn.licencePlateExpiryDate;
        }
        else {
            database.close();
            return {
                success: false,
                message: licencePlateExpiryDateReturn.message
            };
        }
    }
    const info = database.prepare("insert into ParkingTickets" +
        " (ticketNumber, issueDate, issueTime, issuingOfficer," +
        " locationKey, locationDescription," +
        " bylawNumber, parkingOffence, offenceAmount, discountOffenceAmount, discountDays," +
        " licencePlateCountry, licencePlateProvince, licencePlateNumber," +
        " licencePlateIsMissing, licencePlateExpiryDate, vehicleMakeModel, vehicleVIN," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(requestBody.ticketNumber, issueDate, dateTimeFns.timeStringToInteger(requestBody.issueTimeString), requestBody.issuingOfficer, requestBody.locationKey, requestBody.locationDescription, requestBody.bylawNumber, requestBody.parkingOffence, requestBody.offenceAmount, requestBody.discountOffenceAmount, requestBody.discountDays, requestBody.licencePlateCountry, requestBody.licencePlateProvince, requestBody.licencePlateNumber, (requestBody.licencePlateIsMissing ? 1 : 0), licencePlateExpiryDate, requestBody.vehicleMakeModel, requestBody.vehicleVIN, requestSession.user.userName, nowMillis, requestSession.user.userName, nowMillis);
    database.close();
    return {
        success: true,
        ticketID: intLikeToNumber(info.lastInsertRowid),
        nextTicketNumber: undefined
    };
};
export default createParkingTicket;
