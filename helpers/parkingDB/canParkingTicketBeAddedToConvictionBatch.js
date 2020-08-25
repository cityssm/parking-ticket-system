"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canParkingTicketBeAddedToConvictionBatch = void 0;
exports.canParkingTicketBeAddedToConvictionBatch = (db, ticketID) => {
    const check = db
        .prepare("select resolvedDate from ParkingTickets" +
        " where ticketID = ?" +
        " and recordDelete_timeMillis is null")
        .get(ticketID);
    if (!check || check.resolvedDate) {
        return false;
    }
    return true;
};
