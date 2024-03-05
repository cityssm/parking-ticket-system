import removeParkingTicketFromConvictionBatch from '../../database/parkingDB/removeParkingTicketFromConvictionBatch.js';
import { getParkingTicketsAvailableForMTOConvictionBatch } from '../../database/parkingDB-ontario.js';
export default function handler(request, response) {
    const batchId = request.body.batchId;
    const ticketId = request.body.ticketId;
    const result = removeParkingTicketFromConvictionBatch(batchId, ticketId, request.session.user);
    if (result.success) {
        result.tickets = getParkingTicketsAvailableForMTOConvictionBatch();
    }
    response.json(result);
}
