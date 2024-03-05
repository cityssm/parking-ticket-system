import getLookupBatch from '../../database/parkingDB/getLookupBatch.js';
import lockLookupBatch from '../../database/parkingDB/lockLookupBatch.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const result = lockLookupBatch(batchId, request.session.user);
    if (result.success) {
        result.batch = getLookupBatch(batchId);
    }
    response.json(result);
}
