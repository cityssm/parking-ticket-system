"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAllParkingTicketsToConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.addAllParkingTicketsToConvictionBatch = (batchID, ticketIDs, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const lockedBatchCheck = db
        .prepare("select lockDate from ParkingTicketConvictionBatches" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?")
        .get(batchID);
    if (!lockedBatchCheck) {
        db.close();
        return {
            successCount: 0,
            message: "The batch is unavailable."
        };
    }
    else if (lockedBatchCheck.lockDate) {
        db.close();
        return {
            successCount: 0,
            message: "The batch is locked and cannot be updated."
        };
    }
    const rightNow = new Date();
    const statusDate = dateTimeFns.dateToInteger(rightNow);
    const statusTime = dateTimeFns.dateToTimeInteger(rightNow);
    const timeMillis = rightNow.getTime();
    let successCount = 0;
    for (const ticketID of ticketIDs) {
        let newStatusIndex = db
            .prepare("select ifnull(max(statusIndex), -1) + 1 as newStatusIndex" +
            " from ParkingTicketStatusLog" +
            " where ticketID = ?")
            .get(ticketID).newStatusIndex;
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
            successCount += 1;
        }
        else if (batchStatusCheck.statusField === batchID.toString()) {
            successCount += 1;
        }
    }
    db.close();
    return {
        successCount
    };
};
