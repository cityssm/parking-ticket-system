"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAllParkingTicketsToConvictionBatch = exports.addParkingTicketToConvictionBatch = void 0;
const sqlite = require("better-sqlite3");
const createParkingTicketStatus_1 = require("./createParkingTicketStatus");
const isParkingTicketConvicted_1 = require("./isParkingTicketConvicted");
const isParkingTicketInConvictionBatch_1 = require("./isParkingTicketInConvictionBatch");
const isConvictionBatchUpdatable_1 = require("./isConvictionBatchUpdatable");
const canParkingTicketBeAddedToConvictionBatch_1 = require("./canParkingTicketBeAddedToConvictionBatch");
const databasePaths_1 = require("../../data/databasePaths");
const createConvictedStatus = (db, batchID, ticketID, reqSession) => {
    createParkingTicketStatus_1.createParkingTicketStatusWithDB(db, {
        recordType: "status",
        ticketID,
        statusKey: "convicted",
        statusField: batchID.toString(),
        statusField2: "",
        statusNote: ""
    }, reqSession, false);
};
const createConvictionBatchStatus = (db, batchID, ticketID, reqSession) => {
    createParkingTicketStatus_1.createParkingTicketStatusWithDB(db, {
        recordType: "status",
        ticketID,
        statusKey: "convictionBatch",
        statusField: batchID.toString(),
        statusField2: "",
        statusNote: ""
    }, reqSession, false);
};
const addParkingTicketToConvictionBatchAfterBatchCheck = (db, batchID, ticketID, reqSession) => {
    const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch_1.canParkingTicketBeAddedToConvictionBatch(db, ticketID);
    if (!ticketIsAvailable) {
        return {
            success: false,
            message: "The ticket cannot be added to the batch."
        };
    }
    const parkingTicketIsConvicted = isParkingTicketConvicted_1.isParkingTicketConvicted(db, ticketID);
    if (!parkingTicketIsConvicted) {
        createConvictedStatus(db, batchID, ticketID, reqSession);
    }
    const parkingTicketInBatch = isParkingTicketInConvictionBatch_1.isParkingTicketInConvictionBatch(db, ticketID);
    if (!parkingTicketInBatch.inBatch) {
        createConvictionBatchStatus(db, batchID, ticketID, reqSession);
    }
    else {
        return {
            success: false,
            message: "Parking ticket already included in conviction batch #" +
                parkingTicketInBatch.batchIDString +
                "."
        };
    }
    return {
        success: true
    };
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
    const result = addParkingTicketToConvictionBatchAfterBatchCheck(db, batchID, ticketID, reqSession);
    return result;
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
    let successCount = 0;
    for (const ticketID of ticketIDs) {
        const result = addParkingTicketToConvictionBatchAfterBatchCheck(db, batchID, ticketID, reqSession);
        if (result.success) {
            successCount += 1;
        }
    }
    db.close();
    return {
        successCount
    };
};
