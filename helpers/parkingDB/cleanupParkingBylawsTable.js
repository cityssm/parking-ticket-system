import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const cleanupParkingBylawsTable = () => {
    const db = sqlite(dbPath);
    const recordsToDelete = db.prepare("select bylawNumber from ParkingBylaws b" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)" +
        " and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)")
        .all();
    for (const recordToDelete of recordsToDelete) {
        db.prepare("delete from ParkingBylaws" +
            " where bylawNumber = ?" +
            " and isActive = 0")
            .run(recordToDelete.bylawNumber);
    }
    db.close();
    return true;
};
export default cleanupParkingBylawsTable;
