import sqlite from "better-sqlite3";
import { createParkingTicketStatusWithDB } from "./createParkingTicketStatus.js";
import { isParkingTicketConvictedWithDB } from "./isParkingTicketConvicted.js";
import { isParkingTicketInConvictionBatchWithDB } from "./isParkingTicketInConvictionBatch.js";
import { isConvictionBatchUpdatableWithDB } from "./isConvictionBatchUpdatable.js";
import { canParkingTicketBeAddedToConvictionBatch } from "./canParkingTicketBeAddedToConvictionBatch.js";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
const createStatus = (database, batchID, ticketID, statusKey, requestSession) => {
    createParkingTicketStatusWithDB(database, {
        recordType: "status",
        ticketID,
        statusKey,
        statusField: batchID.toString(),
        statusField2: "",
        statusNote: ""
    }, requestSession, false);
};
const createConvictedStatus = (database, batchID, ticketID, requestSession) => {
    createStatus(database, batchID, ticketID, "convicted", requestSession);
};
const createConvictionBatchStatus = (database, batchID, ticketID, requestSession) => {
    createStatus(database, batchID, ticketID, "convictionBatch", requestSession);
};
const convictIfNotConvicted = (database, batchID, ticketID, requestSession) => {
    const parkingTicketIsConvicted = isParkingTicketConvictedWithDB(database, ticketID);
    if (!parkingTicketIsConvicted) {
        createConvictedStatus(database, batchID, ticketID, requestSession);
    }
};
const addParkingTicketToConvictionBatchAfterBatchCheck = (database, batchID, ticketID, requestSession) => {
    const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(database, ticketID);
    if (!ticketIsAvailable) {
        return {
            success: false,
            message: "The ticket cannot be added to the batch."
        };
    }
    convictIfNotConvicted(database, batchID, ticketID, requestSession);
    const parkingTicketInBatch = isParkingTicketInConvictionBatchWithDB(database, ticketID);
    if (!parkingTicketInBatch.inBatch) {
        createConvictionBatchStatus(database, batchID, ticketID, requestSession);
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
export const addParkingTicketToConvictionBatch = (batchID, ticketID, requestSession) => {
    const database = sqlite(databasePath);
    const batchIsAvailable = isConvictionBatchUpdatableWithDB(database, batchID);
    if (!batchIsAvailable) {
        database.close();
        return {
            success: false,
            message: "The batch cannot be updated."
        };
    }
    const result = addParkingTicketToConvictionBatchAfterBatchCheck(database, batchID, ticketID, requestSession);
    return result;
};
export const addAllParkingTicketsToConvictionBatch = (batchID, ticketIDs, requestSession) => {
    const database = sqlite(databasePath);
    const batchIsAvailable = isConvictionBatchUpdatableWithDB(database, batchID);
    if (!batchIsAvailable) {
        database.close();
        return {
            success: false,
            successCount: 0,
            message: "The batch cannot be updated."
        };
    }
    let successCount = 0;
    for (const ticketID of ticketIDs) {
        const result = addParkingTicketToConvictionBatchAfterBatchCheck(database, batchID, ticketID, requestSession);
        if (result.success) {
            successCount += 1;
        }
    }
    database.close();
    return {
        success: true,
        successCount
    };
};
export default addParkingTicketToConvictionBatch;
