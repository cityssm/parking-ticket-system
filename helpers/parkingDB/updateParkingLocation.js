import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const updateParkingLocation = (reqBody) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingLocations" +
        " set locationName = ?," +
        " locationClassKey = ?" +
        " where locationKey = ?" +
        " and isActive = 1")
        .run(reqBody.locationName, reqBody.locationClassKey, reqBody.locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default updateParkingLocation;
