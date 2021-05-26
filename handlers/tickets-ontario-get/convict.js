import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";
import getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch.js";
export const handler = (_req, res) => {
    const tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    const batch = getConvictionBatch(-1);
    res.render("mto-ticketConvict", {
        headTitle: "Convict Parking Tickets",
        tickets,
        batch
    });
};
export default handler;
