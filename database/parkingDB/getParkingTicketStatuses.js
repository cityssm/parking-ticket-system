import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../parkingDB.js';
export default function getParkingTicketStatuses(ticketId, sessionUser, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath, { readonly: true });
    const statusRows = database
        .prepare(`select * from ParkingTicketStatusLog
        where recordDelete_timeMillis is null
        and ticketId = ?
        order by statusDate desc, statusTime desc, statusIndex desc`)
        .all(ticketId);
    for (const status of statusRows) {
        status.recordType = 'status';
        status.statusDateString = dateIntegerToString(status.statusDate);
        status.statusTimeString = timeIntegerToString(status.statusTime);
        status.canUpdate = canUpdateObject(status, sessionUser);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return statusRows;
}
