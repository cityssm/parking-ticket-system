"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_ontario = require("../../helpers/parkingDB-ontario");
const parkingDB_getConvictionBatch = require("../../helpers/parkingDB/getConvictionBatch");
exports.handler = (_req, res) => {
    const tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    const batch = parkingDB_getConvictionBatch.getConvictionBatch(-1);
    res.render("mto-ticketConvict", {
        headTitle: "Convict Parking Tickets",
        tickets,
        batch
    });
};
