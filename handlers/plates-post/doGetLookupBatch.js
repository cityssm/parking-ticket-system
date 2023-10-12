import { getLookupBatch } from '../../database/parkingDB/getLookupBatch.js';
export const handler = (request, response) => {
    const batch = getLookupBatch(request.body.batchID);
    return response.json(batch);
};
export default handler;
