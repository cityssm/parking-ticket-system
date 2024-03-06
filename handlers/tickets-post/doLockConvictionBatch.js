import lockConvictionBatch from '../../database/parkingDB/lockConvictionBatch.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const result = lockConvictionBatch(batchId, request.session.user);
    response.json(result);
}
