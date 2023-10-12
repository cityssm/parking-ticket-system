import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canParkingTicketBeAddedToConvictionBatch } from './canParkingTicketBeAddedToConvictionBatch.js';
import { createParkingTicketStatusWithDB } from './createParkingTicketStatus.js';
import { isConvictionBatchUpdatableWithDB } from './isConvictionBatchUpdatable.js';
import { isParkingTicketConvictedWithDB } from './isParkingTicketConvicted.js';
import { isParkingTicketInConvictionBatchWithDB } from './isParkingTicketInConvictionBatch.js';
function createStatus(database, batchID, ticketID, statusKey, requestSession) {
    createParkingTicketStatusWithDB(database, {
        recordType: 'status',
        ticketID,
        statusKey,
        statusField: batchID.toString(),
        statusField2: '',
        statusNote: ''
    }, requestSession, false);
}
function createConvictedStatus(database, batchID, ticketID, requestSession) {
    createStatus(database, batchID, ticketID, 'convicted', requestSession);
}
function createConvictionBatchStatus(database, batchID, ticketID, requestSession) {
    createStatus(database, batchID, ticketID, 'convictionBatch', requestSession);
}
function convictIfNotConvicted(database, batchID, ticketID, requestSession) {
    const parkingTicketIsConvicted = isParkingTicketConvictedWithDB(database, ticketID);
    if (!parkingTicketIsConvicted) {
        createConvictedStatus(database, batchID, ticketID, requestSession);
    }
}
function addParkingTicketToConvictionBatchAfterBatchCheck(database, batchID, ticketID, requestSession) {
    const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(database, ticketID);
    if (!ticketIsAvailable) {
        return {
            success: false,
            message: 'The ticket cannot be added to the batch.'
        };
    }
    convictIfNotConvicted(database, batchID, ticketID, requestSession);
    const parkingTicketInBatch = isParkingTicketInConvictionBatchWithDB(database, ticketID);
    if (parkingTicketInBatch.inBatch) {
        return {
            success: false,
            message: `Parking ticket already included in conviction batch #${parkingTicketInBatch.batchIDString ?? ''}.`
        };
    }
    else {
        createConvictionBatchStatus(database, batchID, ticketID, requestSession);
    }
    return {
        success: true
    };
}
export function addParkingTicketToConvictionBatch(batchID, ticketID, requestSession) {
    const database = sqlite(databasePath);
    const batchIsAvailable = isConvictionBatchUpdatableWithDB(database, batchID);
    if (!batchIsAvailable) {
        database.close();
        return {
            success: false,
            message: 'The batch cannot be updated.'
        };
    }
    return addParkingTicketToConvictionBatchAfterBatchCheck(database, batchID, ticketID, requestSession);
}
export const addAllParkingTicketsToConvictionBatch = (batchID, ticketIDs, requestSession) => {
    const database = sqlite(databasePath);
    const batchIsAvailable = isConvictionBatchUpdatableWithDB(database, batchID);
    if (!batchIsAvailable) {
        database.close();
        return {
            success: false,
            successCount: 0,
            message: 'The batch cannot be updated.'
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
