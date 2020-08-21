"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParkingBylaw = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.updateParkingBylaw = (reqBody) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const info = db.prepare("update ParkingBylaws" +
        " set bylawDescription = ?" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(reqBody.bylawDescription, reqBody.bylawNumber);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
