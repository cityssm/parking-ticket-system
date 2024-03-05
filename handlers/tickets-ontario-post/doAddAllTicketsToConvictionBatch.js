import { addAllParkingTicketsToConvictionBatch } from '../../database/parkingDB/addParkingTicketToConvictionBatch.js';
import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js';
import { getParkingTicketsAvailableForMTOConvictionBatch } from '../../database/parkingDB-ontario.js';
export default function handler(request, response) {
    const batchId = request.body.batchId;
    const ticketIds = request.body.ticketIds;
    const result = addAllParkingTicketsToConvictionBatch(batchId, ticketIds, request.session.user);
    if (result.successCount > 0) {
        result.batch = getConvictionBatch(batchId);
        result.tickets = getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return response.json(result);
}
