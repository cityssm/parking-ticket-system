"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextParkingTicketRemarkIndex = void 0;
exports.getNextParkingTicketRemarkIndex = (db, ticketID) => {
    const remarkIndexNew = db.prepare("select ifnull(max(remarkIndex), 0) as remarkIndexMax" +
        " from ParkingTicketRemarks" +
        " where ticketID = ?")
        .get(ticketID)
        .remarkIndexMax + 1;
    return remarkIndexNew;
};
