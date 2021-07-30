import sqlite from "better-sqlite3";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const updateParkingOffence = (requestBody) => {
    const database = sqlite(databasePath);
    const info = database.prepare("update ParkingOffences" +
        " set parkingOffence = ?," +
        " offenceAmount = ?," +
        " discountOffenceAmount = ?," +
        " discountDays = ?," +
        " accountNumber = ?" +
        " where bylawNumber = ?" +
        " and locationKey = ?" +
        " and isActive = 1")
        .run(requestBody.parkingOffence, requestBody.offenceAmount, requestBody.discountOffenceAmount, requestBody.discountDays, requestBody.accountNumber, requestBody.bylawNumber, requestBody.locationKey);
    database.close();
    return {
        success: (info.changes > 0)
    };
};
export default updateParkingOffence;
