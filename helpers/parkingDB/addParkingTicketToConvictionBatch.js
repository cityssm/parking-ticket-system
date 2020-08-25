"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAllParkingTicketsToConvictionBatch = exports.addParkingTicketToConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const isConvictionBatchUpdatable_1 = require("./isConvictionBatchUpdatable");
const canParkingTicketBeAddedToConvictionBatch_1 = require("./canParkingTicketBeAddedToConvictionBatch");
const getNextParkingTicketStatusIndex_1 = require("./getNextParkingTicketStatusIndex");
const databasePaths_1 = require("../../data/databasePaths");
exports.addParkingTicketToConvictionBatch = (batchID, ticketID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const batchIsAvailable = isConvictionBatchUpdatable_1.isConvictionBatchUpdatable(db, batchID);
    if (!batchIsAvailable) {
        db.close();
        return {
            success: false,
            message: "The batch cannot be updated."
        };
    }
    const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch_1.canParkingTicketBeAddedToConvictionBatch(db, ticketID);
    if (!ticketIsAvailable) {
        db.close();
        return {
            success: false,
            message: "The ticket cannot be added to the batch."
        };
    }
    let newStatusIndex = getNextParkingTicketStatusIndex_1.getNextParkingTicketStatusIndex(db, ticketID);
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
exports.addAllParkingTicketsToConvictionBatch = (batchID, ticketIDs, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const batchIsAvailable = isConvictionBatchUpdatable_1.isConvictionBatchUpdatable(db, batchID);
    if (!batchIsAvailable) {
        db.close();
        return {
            success: false,
            successCount: 0,
            message: "The batch cannot be updated."
        };
    }
    const rightNow = new Date();
    const statusDate = dateTimeFns.dateToInteger(rightNow);
    const statusTime = dateTimeFns.dateToTimeInteger(rightNow);
    const timeMillis = rightNow.getTime();
    let successCount = 0;
    for (const ticketID of ticketIDs) {
        let newStatusIndex = getNextParkingTicketStatusIndex_1.getNextParkingTicketStatusIndex(db, ticketID);
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
