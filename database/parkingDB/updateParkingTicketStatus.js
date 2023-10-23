import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const updateParkingTicketStatus = (requestBody, sessionUser) => {
    const database = sqlite(databasePath);
    const info = database
        .prepare(`update ParkingTicketStatusLog
        set statusDate = ?,
        statusTime = ?,
        statusKey = ?,
        statusField = ?,
        statusField2 = ?,
        statusNote = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where ticketID = ?
        and statusIndex = ?
        and recordDelete_timeMillis is null`)
        .run(dateTimeFns.dateStringToInteger(requestBody.statusDateString), dateTimeFns.timeStringToInteger(requestBody.statusTimeString), requestBody.statusKey, requestBody.statusField, requestBody.statusField2, requestBody.statusNote, sessionUser.userName, Date.now(), requestBody.ticketID, requestBody.statusIndex);
    database.close();
    return {
        success: info.changes > 0
    };
};
export default updateParkingTicketStatus;
