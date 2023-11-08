import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canParkingTicketBeAddedToConvictionBatch } from './canParkingTicketBeAddedToConvictionBatch.js';
import { createParkingTicketStatus } from './createParkingTicketStatus.js';
import { isConvictionBatchUpdatable } from './isConvictionBatchUpdatable.js';
import { isParkingTicketConvicted } from './isParkingTicketConvicted.js';
import { isParkingTicketInConvictionBatchWithDB } from './isParkingTicketInConvictionBatch.js';
function createStatus(batchId, ticketId, statusKey, sessionUser, connectedDatabase) {
    createParkingTicketStatus({
        recordType: 'status',
        ticketId,
        statusKey,
        statusField: batchId.toString(),
        statusField2: '',
        statusNote: ''
    }, sessionUser, false, connectedDatabase);
}
function createConvictedStatus(batchId, ticketId, sessionUser, connectedDatabase) {
    createStatus(batchId, ticketId, 'convicted', sessionUser, connectedDatabase);
}
function createConvictionBatchStatus(batchId, ticketId, sessionUser, connectedDatabase) {
    createStatus(batchId, ticketId, 'convictionBatch', sessionUser, connectedDatabase);
}
function convictIfNotConvicted(batchId, ticketId, sessionUser, connectedDatabase) {
    const parkingTicketIsConvicted = isParkingTicketConvicted(ticketId, connectedDatabase);
    if (!parkingTicketIsConvicted) {
        createConvictedStatus(batchId, ticketId, sessionUser, connectedDatabase);
    }
}
function addParkingTicketToConvictionBatchAfterBatchCheck(batchId, ticketId, sessionUser, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath);
    try {
        const ticketIsAvailable = canParkingTicketBeAddedToConvictionBatch(ticketId, database);
        if (!ticketIsAvailable) {
            return {
                success: false,
                message: 'The ticket cannot be added to the batch.'
            };
        }
        convictIfNotConvicted(batchId, ticketId, sessionUser, database);
        const parkingTicketInBatch = isParkingTicketInConvictionBatchWithDB(database, ticketId);
        if (parkingTicketInBatch.inBatch) {
            return {
                success: false,
                message: `Parking ticket already included in conviction batch #${parkingTicketInBatch.batchIdString ?? ''}.`
            };
        }
        else {
            createConvictionBatchStatus(batchId, ticketId, sessionUser, database);
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
export function addParkingTicketToConvictionBatch(batchId, ticketId, sessionUser) {
    const database = sqlite(databasePath);
    try {
        const batchIsAvailable = isConvictionBatchUpdatable(batchId, database);
        if (!batchIsAvailable) {
            return {
                success: false,
                message: 'The batch cannot be updated.'
            };
        }
        return addParkingTicketToConvictionBatchAfterBatchCheck(batchId, ticketId, sessionUser, database);
    }
    finally {
        database.close();
    }
}
export const addAllParkingTicketsToConvictionBatch = (batchId, ticketIds, sessionUser) => {
    const database = sqlite(databasePath);
    try {
        const batchIsAvailable = isConvictionBatchUpdatable(batchId, database);
        if (!batchIsAvailable) {
            return {
                success: false,
                successCount: 0,
                message: 'The batch cannot be updated.'
            };
        }
        let successCount = 0;
        for (const ticketId of ticketIds) {
            const result = addParkingTicketToConvictionBatchAfterBatchCheck(batchId, ticketId, sessionUser, database);
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
