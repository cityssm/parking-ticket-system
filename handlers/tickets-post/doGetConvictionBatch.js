import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js';
export default function handler(request, response) {
    const batch = getConvictionBatch(Number.parseInt(request.body.batchId, 10));
    response.json(batch);
}
