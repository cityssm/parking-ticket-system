import { unlockConvictionBatch } from '../../database/parkingDB/unlockConvictionBatch.js';
export const handler = (request, response) => {
    const batchId = request.body.batchId;
    const success = unlockConvictionBatch(batchId, request.session.user);
    return response.json({ success });
};
export default handler;
