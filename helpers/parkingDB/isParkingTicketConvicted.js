"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isParkingTicketConvicted = void 0;
exports.isParkingTicketConvicted = (db, ticketID) => {
    const convictedStatusCheck = db
        .prepare("select statusIndex from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " and statusKey = 'convicted'")
        .get(ticketID);
    if (convictedStatusCheck) {
        return true;
    }
    return false;
};
