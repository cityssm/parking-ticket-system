import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";
import { getConvictionBatch } from "../../helpers/parkingDB/getConvictionBatch.js";
export const handler = (_request, response) => {
    const tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    const batch = getConvictionBatch(-1);
    response.render("mto-ticketConvict", {
        headTitle: "Convict Parking Tickets",
        tickets,
        batch
    });
};
export default handler;
