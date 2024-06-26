import clearLookupBatch from '../../database/parkingDB/clearLookupBatch.js';
import getLookupBatch from '../../database/parkingDB/getLookupBatch.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const result = clearLookupBatch(batchId, request.session.user);
    if (result.success) {
        result.batch = getLookupBatch(batchId);
    }
    response.json(result);
}
