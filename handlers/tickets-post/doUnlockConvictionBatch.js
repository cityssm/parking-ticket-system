import unlockConvictionBatch from '../../database/parkingDB/unlockConvictionBatch.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const success = unlockConvictionBatch(batchId, request.session.user);
    response.json({ success });
}
