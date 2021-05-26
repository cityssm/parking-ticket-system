import sqlite from "better-sqlite3";
import { createParkingTicketStatusWithDB } from "./createParkingTicketStatus.js";
import { isParkingTicketConvictedWithDB } from "./isParkingTicketConvicted.js";
import { isParkingTicketInConvictionBatchWithDB } from "./isParkingTicketInConvictionBatch.js";
import { isConvictionBatchUpdatableWithDB } from "./isConvictionBatchUpdatable.js";
import canParkingTicketBeAddedToConvictionBatch from "./canParkingTicketBeAddedToConvictionBatch.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
const createStatus = (db, batchID, ticketID, statusKey, reqSession) => {
    createParkingTicketStatusWithDB(db, {
        recordType: "status",
        ticketID,
        statusKey,
        statusField: batchID.toString(),
        statusField2: "",
        statusNote: ""
    }, reqSession, false);
};
const createConvictedStatus = (db, batchID, ticketID, reqSession) => {
    createStatus(db, batchID, ticketID, "convicted", reqSession);
};
const createConvictionBatchStatus = (db, batchID, ticketID, reqSession) => {
    createStatus(db, batchID, ticketID, "convictionBatch", reqSession);
};
const convictIfNotConvicted = (db, batchID, ticketID, reqSession) => {
    const parkingTicketIsConvicted = isParkingTicketConvictedWithDB(db, ticketID);
    if (!parkingTicketIsConvicted) {
        createConvictedStatus(db, batchID, ticketID, reqSession);
    }
};
const addParkingTicketToConvictionBatchAfterBatchCheck = (db, batchID, ticketID, reqSession) => {
    const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(db, ticketID);
    if (!ticketIsAvailable) {
        return {
            success: false,
            message: "The ticket cannot be added to the batch."
        };
    }
    convictIfNotConvicted(db, batchID, ticketID, reqSession);
    const parkingTicketInBatch = isParkingTicketInConvictionBatchWithDB(db, ticketID);
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
export const addParkingTicketToConvictionBatch = (batchID, ticketID, reqSession) => {
    const db = sqlite(dbPath);
    const batchIsAvailable = isConvictionBatchUpdatableWithDB(db, batchID);
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
export const addAllParkingTicketsToConvictionBatch = (batchID, ticketIDs, reqSession) => {
    const db = sqlite(dbPath);
    const batchIsAvailable = isConvictionBatchUpdatableWithDB(db, batchID);
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
        success: true,
        successCount
    };
};
export default addParkingTicketToConvictionBatch;
