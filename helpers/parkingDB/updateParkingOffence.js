import sqlite from "better-sqlite3";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const updateParkingOffence = (reqBody) => {
    const db = sqlite(dbPath);
    const info = db.prepare("update ParkingOffences" +
        " set parkingOffence = ?," +
        " offenceAmount = ?," +
        " discountOffenceAmount = ?," +
        " discountDays = ?," +
        " accountNumber = ?" +
        " where bylawNumber = ?" +
        " and locationKey = ?" +
        " and isActive = 1")
        .run(reqBody.parkingOffence, reqBody.offenceAmount, reqBody.discountOffenceAmount, reqBody.discountDays, reqBody.accountNumber, reqBody.bylawNumber, reqBody.locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
export default updateParkingOffence;
