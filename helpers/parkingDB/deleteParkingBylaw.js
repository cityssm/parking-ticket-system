import sqlite from "better-sqlite3";
import { parkingDB as databasePath } from "../../data/databasePaths.js";
export const deleteParkingBylaw = (bylawNumber) => {
    const database = sqlite(databasePath);
    const info = database.prepare("update ParkingBylaws" +
        " set isActive = 0" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(bylawNumber);
    database.close();
    return {
        success: (info.changes > 0)
    };
};
export default deleteParkingBylaw;
