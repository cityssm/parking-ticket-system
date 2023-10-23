import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { canUpdateObject } from '../parkingDB.js';
export const getParkingTicketRemarksWithDB = (database, ticketID, sessionUser) => {
    const remarkRows = database
        .prepare(`select * from ParkingTicketRemarks
        where recordDelete_timeMillis is null
        and ticketID = ?
        order by remarkDate desc, remarkTime desc, remarkIndex desc`)
        .all(ticketID);
    for (const remark of remarkRows) {
        remark.recordType = 'remark';
        remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate);
        remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime);
        remark.canUpdate = canUpdateObject(remark, sessionUser);
    }
    return remarkRows;
};
export const getParkingTicketRemarks = (ticketID, sessionUser) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    return getParkingTicketRemarksWithDB(database, ticketID, sessionUser);
};
export default getParkingTicketRemarks;
