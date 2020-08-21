"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingLocation = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.deleteParkingLocation = (locationKey) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const info = db.prepare("update ParkingLocations" +
        " set isActive = 0" +
        " where locationKey = ?" +
        " and isActive = 1")
        .run(locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
