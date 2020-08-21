"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingOffence = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.deleteParkingOffence = (bylawNumber, locationKey) => {
    const db = sqlite(databasePaths_1.parkingDB);
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
