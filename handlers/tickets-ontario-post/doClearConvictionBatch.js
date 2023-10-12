import * as parkingDB_ontario from '../../database/parkingDB-ontario.js';
import { clearConvictionBatch } from '../../database/parkingDB/clearConvictionBatch.js';
import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js';
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const result = clearConvictionBatch(batchID, request.session);
    if (result.success) {
        result.batch = getConvictionBatch(batchID);
        result.tickets =
            parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return response.json(result);
};
export default handler;
