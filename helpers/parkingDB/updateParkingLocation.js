"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParkingLocation = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.updateParkingLocation = (reqBody) => {
    const db = sqlite(databasePaths_1.parkingDB);
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
