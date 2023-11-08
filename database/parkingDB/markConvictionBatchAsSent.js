import * as dateTimeFns from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function markConvictionBatchAsSent(batchId, sessionUser) {
    const database = sqlite(databasePath);
    const rightNow = new Date();
    const info = database
        .prepare(`update ParkingTicketConvictionBatches
        set sentDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchId = ?
        and recordDelete_timeMillis is null
        and lockDate is not null
        and sentDate is null`)
        .run(dateTimeFns.dateToInteger(rightNow), sessionUser.userName, rightNow.getTime(), batchId);
    database
        .prepare(`update ParkingTickets
        set resolvedDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where resolvedDate is null
        and exists (
          select 1 from ParkingTicketStatusLog s
          where ParkingTickets.ticketId = s.ticketId
          and s.recordDelete_timeMillis is null
          and s.statusField = ?)`)
        .run(dateTimeFns.dateToInteger(rightNow), sessionUser.userName, rightNow.getTime(), batchId.toString());
    database.close();
    return info.changes > 0;
}
export default markConvictionBatchAsSent;
