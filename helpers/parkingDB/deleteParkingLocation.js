"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingLocation = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.deleteParkingLocation = (locationKey) => {
    const db = sqlite(parkingDB_1.dbPath);
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
