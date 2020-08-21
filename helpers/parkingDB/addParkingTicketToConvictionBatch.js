"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addParkingTicketToConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.addParkingTicketToConvictionBatch = (batchID, ticketID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const lockedBatchCheck = db
        .prepare("select lockDate from ParkingTicketConvictionBatches" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?")
        .get(batchID);
    if (!lockedBatchCheck) {
        db.close();
        return {
            success: false,
            message: "The batch is unavailable."
        };
    }
    else if (lockedBatchCheck.lockDate) {
        db.close();
        return {
            success: false,
            message: "The batch is locked and cannot be updated."
        };
    }
    const resolvedDateRecord = db
        .prepare("select resolvedDate from ParkingTickets" +
        " where ticketID = ?" +
        " and recordDelete_timeMillis is null")
        .get(ticketID);
    if (!resolvedDateRecord) {
        db.close();
        return {
            success: false,
            message: "The ticket is unavailable."
        };
    }
    else if (resolvedDateRecord.resolvedDate) {
        db.close();
        return {
            success: false,
            message: "The ticket has been resolved and cannot be added to a conviction batch."
        };
    }
    let newStatusIndex = db
        .prepare("select ifnull(max(statusIndex), -1) + 1 as newStatusIndex" +
        " from ParkingTicketStatusLog" +
        " where ticketID = ?")
        .get(ticketID).newStatusIndex;
    const rightNow = new Date();
    const statusDate = dateTimeFns.dateToInteger(rightNow);
    const statusTime = dateTimeFns.dateToTimeInteger(rightNow);
    const timeMillis = rightNow.getTime();
    const convictedStatusCheck = db
        .prepare("select statusIndex from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey = 'convicted'")
        .get(ticketID);
    if (!convictedStatusCheck) {
        db.prepare("insert into ParkingTicketStatusLog" +
            " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
            " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(ticketID, newStatusIndex, statusDate, statusTime, "convicted", batchID.toString(), "", reqSession.user.userName, timeMillis, reqSession.user.userName, timeMillis);
        newStatusIndex += 1;
    }
    const batchStatusCheck = db
        .prepare("select statusField from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey = 'convictionBatch'")
        .get(ticketID);
    if (!batchStatusCheck) {
        db.prepare("insert into ParkingTicketStatusLog" +
            " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
            " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(ticketID, newStatusIndex, statusDate, statusTime, "convictionBatch", batchID.toString(), "", reqSession.user.userName, timeMillis, reqSession.user.userName, timeMillis);
        db.close();
        return {
            success: true
        };
    }
    db.close();
    if (batchStatusCheck.statusField === batchID.toString()) {
        return {
            success: true
        };
    }
    else {
        return {
            success: false,
            message: "Parking ticket already included in conviction batch #" +
                batchStatusCheck.statusField +
                "."
        };
    }
};
