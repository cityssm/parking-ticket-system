"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markConvictionBatchAsSent = exports.unlockConvictionBatch = exports.lockConvictionBatch = exports.clearConvictionBatch = exports.removeParkingTicketFromConvictionBatch = exports.addAllParkingTicketsToConvictionBatch = exports.addParkingTicketToConvictionBatch = exports.getParkingTicketConvictionBatch = exports.getLastTenParkingTicketConvictionBatches = exports.createParkingTicketConvictionBatch = void 0;
const parkingDB_1 = require("./parkingDB");
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
exports.createParkingTicketConvictionBatch = (reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const rightNow = new Date();
    const info = db
        .prepare("insert into ParkingTicketConvictionBatches" +
        " (batchDate, recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?)")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    db.close();
    if (info.changes > 0) {
        return {
            success: true,
            batch: {
                batchID: info.lastInsertRowid,
                batchDate: dateTimeFns.dateToInteger(rightNow),
                batchDateString: dateTimeFns.dateToString(rightNow),
                lockDate: null,
                lockDateString: "",
                batchEntries: []
            }
        };
    }
    else {
        return { success: false };
    }
};
exports.getLastTenParkingTicketConvictionBatches = () => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const batches = db
        .prepare("select batchID, batchDate, lockDate, sentDate," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from ParkingTicketConvictionBatches" +
        " where recordDelete_timeMillis is null" +
        " order by batchID desc" +
        " limit 10")
        .all();
    db.close();
    for (const batch of batches) {
        batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
        batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
        batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
    }
    return batches;
};
exports.getParkingTicketConvictionBatch = (batchID_or_negOne) => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const baseBatchSQL = "select batchID, batchDate, lockDate, sentDate," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from ParkingTicketConvictionBatches" +
        " where recordDelete_timeMillis is null";
    let batch;
    if (batchID_or_negOne === -1) {
        batch = db
            .prepare(baseBatchSQL +
            " and lockDate is null" +
            " order by batchID desc" +
            " limit 1")
            .get();
    }
    else {
        batch = db
            .prepare(baseBatchSQL + " and batchID = ?")
            .get(batchID_or_negOne);
    }
    if (!batch) {
        db.close();
        return null;
    }
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
    batch.batchEntries = db
        .prepare("select s.statusIndex," +
        " s.statusDate, s.statusTime," +
        " t.ticketID, t.ticketNumber, t.issueDate," +
        " t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +
        " s.recordCreate_userName, s.recordCreate_timeMillis, s.recordUpdate_userName, s.recordUpdate_timeMillis" +
        " from ParkingTicketStatusLog s" +
        " left join ParkingTickets t on s.ticketID = t.ticketID" +
        " where s.recordDelete_timeMillis is null" +
        " and s.statusKey = 'convictionBatch' and s.statusField = ?" +
        " order by t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber")
        .all(batch.batchID.toString());
    for (const batchEntry of batch.batchEntries) {
        batchEntry.statusDateString = dateTimeFns.dateIntegerToString(batchEntry.statusDate);
        batchEntry.statusTimeString = dateTimeFns.timeIntegerToString(batchEntry.statusTime);
        batchEntry.issueDateString = dateTimeFns.dateIntegerToString(batchEntry.issueDate);
    }
    db.close();
    return batch;
};
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
exports.removeParkingTicketFromConvictionBatch = (batchID, ticketID, reqSession) => {
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
    const rightNowMillis = Date.now();
    const info = db
        .prepare("update ParkingTicketStatusLog" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey in ('convicted', 'convictionBatch')" +
        " and statusField = ?")
        .run(reqSession.user.userName, rightNowMillis, ticketID, batchID.toString());
    db.close();
    return {
        success: info.changes > 0
    };
};
exports.clearConvictionBatch = (batchID, reqSession) => {
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
    const rightNowMillis = Date.now();
    const info = db
        .prepare("update ParkingTicketStatusLog" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and statusKey in ('convicted', 'convictionBatch')" +
        " and statusField = ?")
        .run(reqSession.user.userName, rightNowMillis, batchID.toString());
    db.close();
    return {
        success: info.changes > 0
    };
};
exports.lockConvictionBatch = (batchID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const rightNow = new Date();
    const lockDate = dateTimeFns.dateToInteger(rightNow);
    const info = db
        .prepare("update ParkingTicketConvictionBatches" +
        " set lockDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?" +
        " and lockDate is null")
        .run(lockDate, reqSession.user.userName, rightNow.getTime(), batchID);
    db.close();
    return {
        success: info.changes > 0,
        lockDate,
        lockDateString: dateTimeFns.dateIntegerToString(lockDate)
    };
};
exports.unlockConvictionBatch = (batchID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const rightNowMillis = Date.now();
    const info = db
        .prepare("update ParkingTicketConvictionBatches" +
        " set lockDate = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?" +
        " and lockDate is not null" +
        " and sentDate is null")
        .run(reqSession.user.userName, rightNowMillis, batchID);
    db.close();
    return info.changes > 0;
};
exports.markConvictionBatchAsSent = (batchID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath);
    const rightNow = new Date();
    const info = db
        .prepare("update ParkingTicketConvictionBatches" +
        " set sentDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where batchID = ?" +
        " and recordDelete_timeMillis is null" +
        " and lockDate is not null" +
        " and sentDate is null")
        .run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), batchID);
    db.prepare("update ParkingTickets" +
        " set resolvedDate = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where resolvedDate is null" +
        (" and exists (" +
            "select 1 from ParkingTicketStatusLog s" +
            " where ParkingTickets.ticketID = s.ticketID" +
            " and s.recordDelete_timeMillis is null" +
            " and s.statusField = ?" +
            ")")).run(dateTimeFns.dateToInteger(rightNow), reqSession.user.userName, rightNow.getTime(), batchID.toString());
    db.close();
    return info.changes > 0;
};
