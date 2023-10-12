import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const getParkingTicketID = (ticketNumber) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const ticketRow = database
        .prepare(`select ticketID
        from ParkingTickets
        where ticketNumber = ?
        and recordDelete_timeMillis is null
        order by ticketID desc
        limit 1`)
        .get(ticketNumber);
    database.close();
    if (ticketRow !== undefined) {
        return ticketRow.ticketID;
    }
    return undefined;
};
export default getParkingTicketID;
