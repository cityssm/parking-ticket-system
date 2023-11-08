import { removeParkingTicketFromConvictionBatch } from '../../database/parkingDB/removeParkingTicketFromConvictionBatch.js';
import * as parkingDB_ontario from '../../database/parkingDB-ontario.js';
export const handler = (request, response) => {
    const batchId = request.body.batchId;
    const ticketId = request.body.ticketId;
    const result = removeParkingTicketFromConvictionBatch(batchId, ticketId, request.session.user);
    if (result.success) {
        result.tickets =
            parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return response.json(result);
};
export default handler;
