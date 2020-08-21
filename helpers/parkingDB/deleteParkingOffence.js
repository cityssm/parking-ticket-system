"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingOffence = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.deleteParkingOffence = (bylawNumber, locationKey) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingOffences" +
        " set isActive = 0" +
        " where bylawNumber = ?" +
        " and locationKey = ?" +
        " and isActive = 1")
        .run(bylawNumber, locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
