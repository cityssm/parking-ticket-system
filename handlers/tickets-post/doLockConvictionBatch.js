import { lockConvictionBatch } from '../../database/parkingDB/lockConvictionBatch.js';
export const handler = (request, response) => {
    const batchId = request.body.batchId;
    const result = lockConvictionBatch(batchId, request.session.user);
    return response.json(result);
};
export default handler;
