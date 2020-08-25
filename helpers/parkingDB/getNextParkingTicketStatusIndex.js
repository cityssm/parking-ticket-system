"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextParkingTicketStatusIndex = void 0;
exports.getNextParkingTicketStatusIndex = (db, ticketID) => {
    const statusIndexNew = db.prepare("select ifnull(max(statusIndex), 0) as statusIndexMax" +
        " from ParkingTicketStatusLog" +
        " where ticketID = ?")
        .get(ticketID)
        .statusIndexMax + 1;
    return statusIndexNew;
};
