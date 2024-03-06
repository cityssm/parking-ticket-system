import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../parkingDB.js';
export default function getParkingTicketRemarks(ticketId, sessionUser, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath, { readonly: true });
    const remarkRows = database
        .prepare(`select * from ParkingTicketRemarks
        where recordDelete_timeMillis is null
        and ticketId = ?
        order by remarkDate desc, remarkTime desc, remarkIndex desc`)
        .all(ticketId);
    for (const remark of remarkRows) {
        remark.recordType = 'remark';
        remark.remarkDateString = dateIntegerToString(remark.remarkDate);
        remark.remarkTimeString = timeIntegerToString(remark.remarkTime);
        remark.canUpdate = canUpdateObject(remark, sessionUser);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return remarkRows;
}
