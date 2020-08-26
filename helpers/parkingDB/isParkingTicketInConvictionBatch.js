"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isParkingTicketInConvictionBatch = exports.isParkingTicketInConvictionBatchWithDB = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.isParkingTicketInConvictionBatchWithDB = (db, ticketID) => {
    const batchStatusCheck = db
        .prepare("select statusField from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey = 'convictionBatch'")
        .get(ticketID);
    if (batchStatusCheck) {
        return {
            inBatch: true,
            batchIDString: batchStatusCheck.statusField
        };
    }
    return {
        inBatch: false
    };
};
exports.isParkingTicketInConvictionBatch = (ticketID) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const result = exports.isParkingTicketInConvictionBatchWithDB(db, ticketID);
    db.close();
    return result;
};
