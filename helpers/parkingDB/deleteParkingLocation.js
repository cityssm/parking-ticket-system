import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const deleteParkingLocation = (locationKey) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingLocations" +
        " set isActive = 0" +
        " where locationKey = ?" +
        " and isActive = 1")
        .run(locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default deleteParkingLocation;
