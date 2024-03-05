import { addParkingTicketToConvictionBatch } from '../../database/parkingDB/addParkingTicketToConvictionBatch.js';
import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js';
export const handler = (request, response) => {
    const batchId = request.body.batchId;
    const ticketId = request.body.ticketId;
    const result = addParkingTicketToConvictionBatch(batchId, ticketId, request.session.user);
    if (result.success) {
        result.batch = getConvictionBatch(batchId);
    }
    return response.json(result);
};
export default handler;
