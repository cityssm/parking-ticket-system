import sqlite from "better-sqlite3";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const cleanupParkingLocationsTable = () => {
    const database = sqlite(databasePath);
    const recordsToDelete = database.prepare("select locationKey from ParkingLocations l" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)" +
        " and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)")
        .all();
    for (const record of recordsToDelete) {
        database.prepare("delete from ParkingLocations" +
            " where locationKey = ?" +
            " and isActive = 0")
            .run(record.locationKey);
    }
    database.close();
    return true;
};
export default cleanupParkingLocationsTable;
