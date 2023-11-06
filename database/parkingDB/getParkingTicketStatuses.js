import * as dateTimeFns from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../parkingDB.js';
export const getParkingTicketStatuses = (ticketID, sessionUser, connectedDatabase) => {
    const database = connectedDatabase ?? sqlite(databasePath, { readonly: true });
    const statusRows = database
        .prepare(`select * from ParkingTicketStatusLog
        where recordDelete_timeMillis is null
        and ticketID = ?
        order by statusDate desc, statusTime desc, statusIndex desc`)
        .all(ticketID);
    for (const status of statusRows) {
        status.recordType = 'status';
        status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
        status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);
        status.canUpdate = canUpdateObject(status, sessionUser);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return statusRows;
};
export default getParkingTicketStatuses;
