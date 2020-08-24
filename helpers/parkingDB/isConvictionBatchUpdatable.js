"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConvictionBatchUpdatable = void 0;
exports.isConvictionBatchUpdatable = (db, batchID) => {
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
