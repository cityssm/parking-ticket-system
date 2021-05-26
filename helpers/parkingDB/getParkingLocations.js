import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const getParkingLocations = () => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const rows = db.prepare("select locationKey, locationName, locationClassKey" +
        " from ParkingLocations" +
        " where isActive = 1" +
        " order by orderNumber, locationName")
        .all();
    db.close();
    return rows;
};
export default getParkingLocations;
