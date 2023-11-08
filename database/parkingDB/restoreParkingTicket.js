import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const restoreParkingTicket = (ticketId, sessionUser) => {
    const database = sqlite(databasePath);
    const info = database
        .prepare(`update ParkingTickets
        set recordDelete_userName = null,
        recordDelete_timeMillis = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where ticketId = ?
        and recordDelete_timeMillis is not null`)
        .run(sessionUser.userName, Date.now(), ticketId);
    database.close();
    return {
        success: info.changes > 0
    };
};
export default restoreParkingTicket;
