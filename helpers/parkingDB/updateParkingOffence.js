"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParkingOffence = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.updateParkingOffence = (reqBody) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const info = db.prepare("update ParkingOffences" +
        " set parkingOffence = ?," +
        " offenceAmount = ?," +
        " discountOffenceAmount = ?," +
        " discountDays = ?," +
        " accountNumber = ?" +
        " where bylawNumber = ?" +
        " and locationKey = ?" +
        " and isActive = 1")
        .run(reqBody.parkingOffence, reqBody.offenceAmount, reqBody.discountOffenceAmount, reqBody.discountDays, reqBody.accountNumber, reqBody.bylawNumber, reqBody.locationKey);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
