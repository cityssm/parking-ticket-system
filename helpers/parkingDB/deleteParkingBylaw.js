"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteParkingBylaw = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.deleteParkingBylaw = (bylawNumber) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const info = db.prepare("update ParkingBylaws" +
        " set isActive = 0" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(bylawNumber);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
