"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingLocations = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.getParkingLocations = () => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select locationKey, locationName, locationClassKey" +
        " from ParkingLocations" +
        " where isActive = 1" +
        " order by orderNumber, locationName")
        .all();
    db.close();
    return rows;
};
