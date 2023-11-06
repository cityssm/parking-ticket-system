import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function cleanupParkingTicketsTable(recordDelete_timeMillis) {
    const database = sqlite(databasePath);
    const recordsToDelete = database
        .prepare('select ticketID from ParkingTickets t' +
        ' where t.recordDelete_timeMillis is not null' +
        ' and t.recordDelete_timeMillis < ?' +
        (' and not exists (' +
            'select 1 from LicencePlateLookupBatchEntries b' +
            ' where t.ticketID = b.ticketID)'))
        .all(recordDelete_timeMillis);
    for (const recordToDelete of recordsToDelete) {
        database
            .prepare(`delete from ParkingTicketRemarks
          where ticketID = ?`)
            .run(recordToDelete.ticketID);
        database
            .prepare(`delete from ParkingTicketStatusLog
          where ticketID = ?`)
            .run(recordToDelete.ticketID);
        database
            .prepare(`delete from ParkingTickets
          where ticketID = ?`)
            .run(recordToDelete.ticketID);
    }
    database.close();
    return true;
}
export default cleanupParkingTicketsTable;
