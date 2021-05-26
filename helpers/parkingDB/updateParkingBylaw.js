import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const updateParkingBylaw = (reqBody) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingBylaws" +
        " set bylawDescription = ?" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(reqBody.bylawDescription, reqBody.bylawNumber);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default updateParkingBylaw;
