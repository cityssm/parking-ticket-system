import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const deleteParkingBylaw = (bylawNumber) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingBylaws" +
        " set isActive = 0" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(bylawNumber);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default deleteParkingBylaw;
