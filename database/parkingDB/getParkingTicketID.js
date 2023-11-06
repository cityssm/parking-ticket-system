import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const getParkingTicketID = (ticketNumber) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const ticketID = database
        .prepare(`select ticketID
        from ParkingTickets
        where ticketNumber = ?
        and recordDelete_timeMillis is null
        order by ticketID desc
        limit 1`)
        .pluck()
        .get(ticketNumber);
    database.close();
    console.log(ticketID);
    return ticketID ?? undefined;
};
export default getParkingTicketID;
