import removeParkingTicketFromConvictionBatch from '../../database/parkingDB/removeParkingTicketFromConvictionBatch.js';
import { getParkingTicketsAvailableForMTOConvictionBatch } from '../../database/parkingDB-ontario.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const ticketId = Number.parseInt(request.body.ticketId, 10);
    const result = removeParkingTicketFromConvictionBatch(batchId, ticketId, request.session.user);
    if (result.success) {
        result.tickets = getParkingTicketsAvailableForMTOConvictionBatch();
    }
    response.json(result);
}
