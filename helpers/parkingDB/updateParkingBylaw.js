import sqlite from "better-sqlite3";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const updateParkingBylaw = (requestBody) => {
    const database = sqlite(databasePath);
    const info = database.prepare("update ParkingBylaws" +
        " set bylawDescription = ?" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(requestBody.bylawDescription, requestBody.bylawNumber);
    database.close();
    return {
        success: (info.changes > 0)
    };
};
export default updateParkingBylaw;
