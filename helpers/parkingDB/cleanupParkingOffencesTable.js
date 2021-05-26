import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const cleanupParkingOffencesTable = () => {
    const db = sqlite(dbPath);
    const recordsToDelete = db.prepare("select o.bylawNumber, o.locationKey" +
        " from ParkingOffences o" +
        " where isActive = 0" +
        (" and not exists (" +
            "select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)"))
        .all();
    for (const record of recordsToDelete) {
        db.prepare("delete from ParkingOffences" +
            " where bylawNumber = ?" +
            " and locationKey = ?" +
            " and isActive = 0")
            .run(record.bylawNumber, record.locationKey);
    }
    db.close();
    return true;
};
export default cleanupParkingOffencesTable;
