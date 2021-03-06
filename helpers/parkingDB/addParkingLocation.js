"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addParkingLocation = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.addParkingLocation = (reqBody) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const locationRecord = db.prepare("select locationName, isActive" +
        " from ParkingLocations" +
        " where locationKey = ?")
        .get(reqBody.locationKey);
    if (locationRecord) {
        db.close();
        return {
            success: false,
            message: "The location key \"" + reqBody.locationKey + "\"" +
                " is already associated with the " +
                (locationRecord.isActive ? "" : "inactive ") +
                " record \"" + locationRecord.locationName + "\"."
        };
    }
    const info = db.prepare("insert into ParkingLocations (" +
        "locationKey, locationName, locationClassKey, orderNumber, isActive)" +
        " values (?, ?, ?, 0, 1)")
        .run(reqBody.locationKey, reqBody.locationName, reqBody.locationClassKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
