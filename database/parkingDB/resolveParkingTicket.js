import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function resolveParkingTicketWithDB(database, ticketID, sessionUser) {
    const rightNow = new Date();
    const info = database
        .prepare(`update ParkingTickets
        set resolvedDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where ticketID = ?
        and resolvedDate is null
        and recordDelete_timeMillis is null`)
        .run(dateTimeFns.dateToInteger(rightNow), sessionUser.userName, rightNow.getTime(), ticketID);
    return {
        success: info.changes > 0
    };
}
export function resolveParkingTicket(ticketID, sessionUser) {
    const database = sqlite(databasePath);
    const success = resolveParkingTicketWithDB(database, ticketID, sessionUser);
    database.close();
    return success;
}
export default resolveParkingTicket;
