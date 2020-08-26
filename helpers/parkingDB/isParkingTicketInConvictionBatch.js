"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isParkingTicketInConvictionBatch = void 0;
exports.isParkingTicketInConvictionBatch = (db, ticketID) => {
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
