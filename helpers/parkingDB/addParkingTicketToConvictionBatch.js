"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAllParkingTicketsToConvictionBatch = exports.addParkingTicketToConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const isParkingTicketConvicted_1 = require("./isParkingTicketConvicted");
const isParkingTicketInConvictionBatch_1 = require("./isParkingTicketInConvictionBatch");
const isConvictionBatchUpdatable_1 = require("./isConvictionBatchUpdatable");
const canParkingTicketBeAddedToConvictionBatch_1 = require("./canParkingTicketBeAddedToConvictionBatch");
const getNextParkingTicketStatusIndex_1 = require("./getNextParkingTicketStatusIndex");
const databasePaths_1 = require("../../data/databasePaths");
const createConvictedStatus = (db, params) => {
    db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(params.ticketID, params.newStatusIndex, params.statusDate, params.statusTime, "convicted", params.batchID.toString(), "", params.userName, params.timeMillis, params.userName, params.timeMillis);
};
const createConvictionBatchStatus = (db, params) => {
    db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(params.ticketID, params.newStatusIndex, params.statusDate, params.statusTime, "convictionBatch", params.batchID.toString(), "", params.userName, params.timeMillis, params.userName, params.timeMillis);
};
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
    const parkingTicketIsConvicted = isParkingTicketConvicted_1.isParkingTicketConvicted(db, ticketID);
    if (!parkingTicketIsConvicted) {
        createConvictedStatus(db, {
            ticketID,
            newStatusIndex,
            statusDate,
            statusTime,
            batchID,
            userName: reqSession.user.userName,
            timeMillis
        });
        newStatusIndex += 1;
    }
    const parkingTicketInBatch = isParkingTicketInConvictionBatch_1.isParkingTicketInConvictionBatch(db, ticketID);
    if (!parkingTicketInBatch.inBatch) {
        createConvictionBatchStatus(db, {
            ticketID,
            newStatusIndex,
            statusDate,
            statusTime,
            batchID,
            userName: reqSession.user.userName,
            timeMillis
        });
        db.close();
        return {
            success: true
        };
    }
    db.close();
    if (parkingTicketInBatch.batchIDString === batchID.toString()) {
        return {
            success: true
        };
    }
    else {
        return {
            success: false,
            message: "Parking ticket already included in conviction batch #" +
                parkingTicketInBatch.batchIDString +
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
        const parkingTicketIsConvicted = isParkingTicketConvicted_1.isParkingTicketConvicted(db, ticketID);
        if (!parkingTicketIsConvicted) {
            createConvictedStatus(db, {
                ticketID,
                newStatusIndex,
                statusDate,
                statusTime,
                batchID,
                userName: reqSession.user.userName,
                timeMillis
            });
            newStatusIndex += 1;
        }
        const parkingTicketInBatch = isParkingTicketInConvictionBatch_1.isParkingTicketInConvictionBatch(db, ticketID);
        if (!parkingTicketInBatch.inBatch) {
            createConvictionBatchStatus(db, {
                ticketID,
                newStatusIndex,
                statusDate,
                statusTime,
                batchID,
                userName: reqSession.user.userName,
                timeMillis
            });
            successCount += 1;
        }
        else if (parkingTicketInBatch.batchIDString === batchID.toString()) {
            successCount += 1;
        }
    }
    db.close();
    return {
        successCount
    };
};
