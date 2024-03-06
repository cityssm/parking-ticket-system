import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js';
import markConvictionBatchAsSent from '../../database/parkingDB/markConvictionBatchAsSent.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const success = markConvictionBatchAsSent(batchId, request.session.user);
    const batch = getConvictionBatch(batchId);
    response.json({
        success,
        batch
    });
}
