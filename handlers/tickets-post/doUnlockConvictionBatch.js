import { unlockConvictionBatch } from '../../database/parkingDB/unlockConvictionBatch.js';
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const success = unlockConvictionBatch(batchID, request.session.user);
    return response.json({ success });
};
export default handler;
