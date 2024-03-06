import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function cleanupParkingTicketsTable(recordDelete_timeMillis) {
    const database = sqlite(databasePath);
    const recordsToDelete = database
        .prepare(`select ticketId from ParkingTickets t
        where t.recordDelete_timeMillis is not null
        and t.recordDelete_timeMillis < ?
        and not exists (select 1 from LicencePlateLookupBatchEntries b where t.ticketId = b.ticketId)`)
        .all(recordDelete_timeMillis);
    for (const recordToDelete of recordsToDelete) {
        database
            .prepare(`delete from ParkingTicketRemarks
          where ticketId = ?`)
            .run(recordToDelete.ticketId);
        database
            .prepare(`delete from ParkingTicketStatusLog
          where ticketId = ?`)
            .run(recordToDelete.ticketId);
        database
            .prepare(`delete from ParkingTickets
          where ticketId = ?`)
            .run(recordToDelete.ticketId);
    }
    database.close();
    return true;
}
