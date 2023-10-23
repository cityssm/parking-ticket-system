import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canParkingTicketBeAddedToConvictionBatch } from './canParkingTicketBeAddedToConvictionBatch.js';
import { createParkingTicketStatusWithDB } from './createParkingTicketStatus.js';
import { isConvictionBatchUpdatableWithDB } from './isConvictionBatchUpdatable.js';
import { isParkingTicketConvictedWithDB } from './isParkingTicketConvicted.js';
import { isParkingTicketInConvictionBatchWithDB } from './isParkingTicketInConvictionBatch.js';
function createStatus(database, batchID, ticketID, statusKey, sessionUser) {
    createParkingTicketStatusWithDB(database, {
        recordType: 'status',
        ticketID,
        statusKey,
        statusField: batchID.toString(),
        statusField2: '',
        statusNote: ''
    }, sessionUser, false);
}
function createConvictedStatus(database, batchID, ticketID, sessionUser) {
    createStatus(database, batchID, ticketID, 'convicted', sessionUser);
}
function createConvictionBatchStatus(database, batchID, ticketID, sessionUser) {
    createStatus(database, batchID, ticketID, 'convictionBatch', sessionUser);
}
function convictIfNotConvicted(database, batchID, ticketID, sessionUser) {
    const parkingTicketIsConvicted = isParkingTicketConvictedWithDB(database, ticketID);
    if (!parkingTicketIsConvicted) {
        createConvictedStatus(database, batchID, ticketID, sessionUser);
    }
}
function addParkingTicketToConvictionBatchAfterBatchCheck(database, batchID, ticketID, sessionUser) {
    const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(database, ticketID);
    if (!ticketIsAvailable) {
        return {
            success: false,
            message: 'The ticket cannot be added to the batch.'
        };
    }
    convictIfNotConvicted(database, batchID, ticketID, sessionUser);
    const parkingTicketInBatch = isParkingTicketInConvictionBatchWithDB(database, ticketID);
    if (parkingTicketInBatch.inBatch) {
        return {
            success: false,
            message: `Parking ticket already included in conviction batch #${parkingTicketInBatch.batchIDString ?? ''}.`
        };
    }
    else {
        createConvictionBatchStatus(database, batchID, ticketID, sessionUser);
    }
    return {
        success: true
    };
}
export function addParkingTicketToConvictionBatch(batchID, ticketID, sessionUser) {
    const database = sqlite(databasePath);
    const batchIsAvailable = isConvictionBatchUpdatableWithDB(database, batchID);
    if (!batchIsAvailable) {
        database.close();
        return {
            success: false,
            message: 'The batch cannot be updated.'
        };
    }
    return addParkingTicketToConvictionBatchAfterBatchCheck(database, batchID, ticketID, sessionUser);
}
export const addAllParkingTicketsToConvictionBatch = (batchID, ticketIDs, sessionUser) => {
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
        const result = addParkingTicketToConvictionBatchAfterBatchCheck(database, batchID, ticketID, sessionUser);
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
