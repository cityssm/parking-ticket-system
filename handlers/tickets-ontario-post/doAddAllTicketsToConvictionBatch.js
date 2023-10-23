import { addAllParkingTicketsToConvictionBatch } from '../../database/parkingDB/addParkingTicketToConvictionBatch.js';
import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js';
import * as parkingDB_ontario from '../../database/parkingDB-ontario.js';
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const ticketIDs = request.body.ticketIDs;
    const result = addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, request.session.user);
    if (result.successCount > 0) {
        result.batch = getConvictionBatch(batchID);
        result.tickets =
            parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return response.json(result);
};
export default handler;
