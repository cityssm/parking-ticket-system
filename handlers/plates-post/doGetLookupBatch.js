import getLookupBatch from '../../database/parkingDB/getLookupBatch.js';
export default function handler(request, response) {
    const batch = getLookupBatch(Number.parseInt(request.body.batchId, 10));
    response.json(batch);
}
