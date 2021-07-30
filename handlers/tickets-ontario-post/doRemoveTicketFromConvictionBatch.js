import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";
import { removeParkingTicketFromConvictionBatch } from "../../helpers/parkingDB/removeParkingTicketFromConvictionBatch.js";
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const ticketID = request.body.ticketID;
    const result = removeParkingTicketFromConvictionBatch(batchID, ticketID, request.session);
    if (result.success) {
        result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return response.json(result);
};
export default handler;
