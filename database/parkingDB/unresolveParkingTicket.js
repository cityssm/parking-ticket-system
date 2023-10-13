import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import * as configFunctions from '../../helpers/functions.config.js';
export const unresolveParkingTicket = (ticketID, requestSession) => {
    const database = sqlite(databasePath);
    const ticketObject = database
        .prepare(`select recordUpdate_timeMillis from ParkingTickets
        where ticketID = ?
        and recordDelete_timeMillis is null
        and resolvedDate is not null`)
        .get(ticketID);
    if (!ticketObject) {
        database.close();
        return {
            success: false,
            message: 'The ticket has either been deleted, or is no longer marked as resolved.'
        };
    }
    else if (ticketObject.recordUpdate_timeMillis +
        configFunctions.getProperty('parkingTickets.updateWindowMillis') <
        Date.now()) {
        database.close();
        return {
            success: false,
            message: 'The ticket is outside of the window for removing the resolved status.'
        };
    }
    const info = database
        .prepare('update ParkingTickets' +
        ' set resolvedDate = null,' +
        ' recordUpdate_userName = ?,' +
        ' recordUpdate_timeMillis = ?' +
        ' where ticketID = ?' +
        ' and resolvedDate is not null' +
        ' and recordDelete_timeMillis is null')
        .run(requestSession.user.userName, Date.now(), ticketID);
    database.close();
    return {
        success: info.changes > 0
    };
};
export default unresolveParkingTicket;
