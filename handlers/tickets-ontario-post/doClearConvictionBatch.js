import clearConvictionBatch from '../../database/parkingDB/clearConvictionBatch.js';
import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js';
import * as parkingDB_ontario from '../../database/parkingDB-ontario.js';
export default function handler(request, response) {
    const batchId = request.body.batchId;
    const result = clearConvictionBatch(batchId, request.session.user);
    if (result.success) {
        result.batch = getConvictionBatch(batchId);
        result.tickets =
            parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    response.json(result);
}
