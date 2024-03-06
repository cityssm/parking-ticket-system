import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function updateParkingTicketStatus(requestBody, sessionUser) {
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
        where ticketId = ?
        and statusIndex = ?
        and recordDelete_timeMillis is null`)
        .run(dateStringToInteger(requestBody.statusDateString), timeStringToInteger(requestBody.statusTimeString), requestBody.statusKey, requestBody.statusField, requestBody.statusField2, requestBody.statusNote, sessionUser.userName, Date.now(), requestBody.ticketId, requestBody.statusIndex);
    database.close();
    return {
        success: info.changes > 0
    };
}
