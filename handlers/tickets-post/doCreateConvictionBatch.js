import { createConvictionBatch } from '../../database/parkingDB/createConvictionBatch.js';
export const handler = (request, response) => {
    const batchResult = createConvictionBatch(request.session.user);
    return response.json(batchResult);
};
export default handler;
