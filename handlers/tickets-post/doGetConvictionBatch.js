import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js';
export const handler = (request, response) => {
    const batch = getConvictionBatch(request.body.batchId);
    return response.json(batch);
};
export default handler;
