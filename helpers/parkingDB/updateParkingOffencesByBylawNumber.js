"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParkingOffencesByBylawNumber = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.updateParkingOffencesByBylawNumber = (reqBody) => {
    const db = sqlite(parkingDB_1.dbPath);
    const info = db.prepare("update ParkingOffences" +
        " set offenceAmount = ?," +
        " discountOffenceAmount = ?," +
        " discountDays = ?" +
        " where bylawNumber = ?" +
        " and isActive = 1")
        .run(reqBody.offenceAmount, reqBody.discountOffenceAmount, reqBody.discountDays, reqBody.bylawNumber);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
