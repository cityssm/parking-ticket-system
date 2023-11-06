import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canParkingTicketBeAddedToConvictionBatch } from './canParkingTicketBeAddedToConvictionBatch.js';
import { createParkingTicketStatus } from './createParkingTicketStatus.js';
import { isConvictionBatchUpdatable } from './isConvictionBatchUpdatable.js';
import { isParkingTicketConvicted } from './isParkingTicketConvicted.js';
import { isParkingTicketInConvictionBatchWithDB } from './isParkingTicketInConvictionBatch.js';
function createStatus(batchID, ticketID, statusKey, sessionUser, connectedDatabase) {
    createParkingTicketStatus({
        recordType: 'status',
        ticketID,
        statusKey,
        statusField: batchID.toString(),
        statusField2: '',
        statusNote: ''
    }, sessionUser, false, connectedDatabase);
}
function createConvictedStatus(batchID, ticketID, sessionUser, connectedDatabase) {
    createStatus(batchID, ticketID, 'convicted', sessionUser, connectedDatabase);
}
function createConvictionBatchStatus(batchID, ticketID, sessionUser, connectedDatabase) {
    createStatus(batchID, ticketID, 'convictionBatch', sessionUser, connectedDatabase);
}
function convictIfNotConvicted(batchID, ticketID, sessionUser, connectedDatabase) {
    const parkingTicketIsConvicted = isParkingTicketConvicted(ticketID, connectedDatabase);
    if (!parkingTicketIsConvicted) {
        createConvictedStatus(batchID, ticketID, sessionUser, connectedDatabase);
    }
}
function addParkingTicketToConvictionBatchAfterBatchCheck(batchID, ticketID, sessionUser, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath);
    try {
        const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(ticketID, database);
        if (!ticketIsAvailable) {
            return {
                success: false,
                message: 'The ticket cannot be added to the batch.'
            };
        }
        convictIfNotConvicted(batchID, ticketID, sessionUser, database);
        const parkingTicketInBatch = isParkingTicketInConvictionBatchWithDB(database, ticketID);
        if (parkingTicketInBatch.inBatch) {
            return {
                success: false,
                message: `Parking ticket already included in conviction batch #${parkingTicketInBatch.batchIDString ?? ''}.`
            };
        }
        else {
            createConvictionBatchStatus(batchID, ticketID, sessionUser, database);
        }
        return {
            success: true
        };
    }
    finally {
        if (connectedDatabase === undefined) {
            database.close();
        }
    }
}
export function addParkingTicketToConvictionBatch(batchID, ticketID, sessionUser) {
    const database = sqlite(databasePath);
    try {
        const batchIsAvailable = isConvictionBatchUpdatable(batchID, database);
        if (!batchIsAvailable) {
            return {
                success: false,
                message: 'The batch cannot be updated.'
            };
        }
        return addParkingTicketToConvictionBatchAfterBatchCheck(batchID, ticketID, sessionUser, database);
    }
    finally {
        database.close();
    }
}
export const addAllParkingTicketsToConvictionBatch = (batchID, ticketIDs, sessionUser) => {
    const database = sqlite(databasePath);
    try {
        const batchIsAvailable = isConvictionBatchUpdatable(batchID, database);
        if (!batchIsAvailable) {
            return {
                success: false,
                successCount: 0,
                message: 'The batch cannot be updated.'
            };
        }
        let successCount = 0;
        for (const ticketID of ticketIDs) {
            const result = addParkingTicketToConvictionBatchAfterBatchCheck(batchID, ticketID, sessionUser, database);
            if (result.success) {
                successCount += 1;
            }
        }
        return {
            success: true,
            successCount
        };
    }
    finally {
        database.close();
    }
};
export default addParkingTicketToConvictionBatch;
