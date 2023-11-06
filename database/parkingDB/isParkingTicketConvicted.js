import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function isParkingTicketConvicted(ticketID, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath);
    const statusIndex = database
        .prepare('select statusIndex from ParkingTicketStatusLog' +
        ' where recordDelete_timeMillis is null' +
        ' and ticketID = ?' +
        " and statusKey = 'convicted'")
        .pluck()
        .get(ticketID);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return statusIndex !== undefined;
}
export default isParkingTicketConvicted;
