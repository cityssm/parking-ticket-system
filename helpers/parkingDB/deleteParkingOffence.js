import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const deleteParkingOffence = (bylawNumber, locationKey) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingOffences" +
        " set isActive = 0" +
        " where bylawNumber = ?" +
        " and locationKey = ?" +
        " and isActive = 1")
        .run(bylawNumber, locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default deleteParkingOffence;
