"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParkingBylaw = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.updateParkingBylaw = (reqBody) => {
    const db = sqlite(parkingDB_1.dbPath);
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
