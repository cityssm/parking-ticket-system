import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const updateParkingOffencesByBylawNumber = (reqBody) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingOffences" +
        " set offenceAmount = ?," +
        " discountOffenceAmount = ?," +
        " discountDays = ?" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(reqBody.offenceAmount, reqBody.discountOffenceAmount, reqBody.discountDays, reqBody.bylawNumber);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default updateParkingOffencesByBylawNumber;
