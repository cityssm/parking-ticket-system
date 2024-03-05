import clearConvictionBatch from '../../database/parkingDB/clearConvictionBatch.js';
import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js';
import { getParkingTicketsAvailableForMTOConvictionBatch } from '../../database/parkingDB-ontario.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const result = clearConvictionBatch(batchId, request.session.user);
    if (result.success) {
        result.batch = getConvictionBatch(batchId);
        result.tickets = getParkingTicketsAvailableForMTOConvictionBatch();
    }
    response.json(result);
}
