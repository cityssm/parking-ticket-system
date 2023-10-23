import { clearConvictionBatch } from '../../database/parkingDB/clearConvictionBatch.js';
import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js';
import * as parkingDB_ontario from '../../database/parkingDB-ontario.js';
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const result = clearConvictionBatch(batchID, request.session.user);
    if (result.success) {
        result.batch = getConvictionBatch(batchID);
        result.tickets =
            parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return response.json(result);
};
export default handler;
