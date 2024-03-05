import getLookupBatch from '../../database/parkingDB/getLookupBatch.js';
export const handler = (request, response) => {
    const batch = getLookupBatch(request.body.batchId);
    response.json(batch);
};
export default handler;
