import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
export default function unresolveParkingTicket(ticketId, sessionUser) {
    const database = sqlite(databasePath);
    const ticketObject = database
        .prepare(`select recordUpdate_timeMillis from ParkingTickets
        where ticketId = ?
        and recordDelete_timeMillis is null
        and resolvedDate is not null`)
        .get(ticketId);
    if (ticketObject === undefined) {
        database.close();
        return {
            success: false,
            message: 'The ticket has either been deleted, or is no longer marked as resolved.'
        };
    }
    else if (ticketObject.recordUpdate_timeMillis +
        getConfigProperty('parkingTickets.updateWindowMillis') <
        Date.now()) {
        database.close();
        return {
            success: false,
            message: 'The ticket is outside of the window for removing the resolved status.'
        };
    }
    const info = database
        .prepare(`update ParkingTickets
        set resolvedDate = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where ticketId = ?
        and resolvedDate is not null
        and recordDelete_timeMillis is null`)
        .run(sessionUser.userName, Date.now(), ticketId);
    database.close();
    return {
        success: info.changes > 0
    };
}
