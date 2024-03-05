import { addParkingTicketToConvictionBatch } from '../../database/parkingDB/addParkingTicketToConvictionBatch.js';
import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const ticketId = Number.parseInt(request.body.ticketId, 10);
    const result = addParkingTicketToConvictionBatch(batchId, ticketId, request.session.user);
    if (result.success) {
        result.batch = getConvictionBatch(batchId);
    }
    response.json(result);
}
