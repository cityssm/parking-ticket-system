"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConvictionBatchUpdatable = exports.isConvictionBatchUpdatableWithDB = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.isConvictionBatchUpdatableWithDB = (db, batchID) => {
    const check = db
        .prepare("select lockDate from ParkingTicketConvictionBatches" +
        " where recordDelete_timeMillis is null" +
        " and batchID = ?")
        .get(batchID);
    if (!check || check.lockDate) {
        return false;
    }
    return true;
};
exports.isConvictionBatchUpdatable = (ticketID) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const result = exports.isConvictionBatchUpdatableWithDB(db, ticketID);
    db.close();
    return result;
};
