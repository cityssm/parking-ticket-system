import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js';
import { markConvictionBatchAsSent } from '../../database/parkingDB/markConvictionBatchAsSent.js';
export const handler = (request, response) => {
    const batchId = request.body.batchId;
    const success = markConvictionBatchAsSent(batchId, request.session.user);
    const batch = getConvictionBatch(batchId);
    response.json({
        success,
        batch
    });
};
export default handler;
