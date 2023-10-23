import { removeParkingTicketFromConvictionBatch } from '../../database/parkingDB/removeParkingTicketFromConvictionBatch.js';
import * as parkingDB_ontario from '../../database/parkingDB-ontario.js';
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const ticketID = request.body.ticketID;
    const result = removeParkingTicketFromConvictionBatch(batchID, ticketID, request.session.user);
    if (result.success) {
        result.tickets =
            parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return response.json(result);
};
export default handler;
