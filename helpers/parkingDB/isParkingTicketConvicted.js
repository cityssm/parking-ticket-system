import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const isParkingTicketConvictedWithDB = (db, ticketID) => {
    const convictedStatusCheck = db
        .prepare("select statusIndex from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey = 'convicted'")
        .get(ticketID);
    if (convictedStatusCheck) {
        return true;
    }
    return false;
};
export const isParkingTicketConvicted = (ticketID) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const result = isParkingTicketConvictedWithDB(db, ticketID);
    db.close();
    return result;
};
export default isParkingTicketConvicted;
