"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupParkingTicketRemarksTable = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.cleanupParkingTicketRemarksTable = (recordDelete_timeMillis) => {
    const db = sqlite(databasePaths_1.parkingDB);
    db.prepare("delete from ParkingTicketRemarks" +
        " where recordDelete_timeMillis is not null" +
        " and recordDelete_timeMillis < ?")
        .run(recordDelete_timeMillis);
    db.close();
    return true;
};
