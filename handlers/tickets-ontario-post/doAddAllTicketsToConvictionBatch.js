import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";
import { addAllParkingTicketsToConvictionBatch } from "../../helpers/parkingDB/addParkingTicketToConvictionBatch.js";
import { getConvictionBatch } from "../../helpers/parkingDB/getConvictionBatch.js";
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const ticketIDs = request.body.ticketIDs;
    const result = addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, request.session);
    if (result.successCount > 0) {
        result.batch = getConvictionBatch(batchID);
        result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return response.json(result);
};
export default handler;
