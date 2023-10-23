import { clearLookupBatch } from '../../database/parkingDB/clearLookupBatch.js';
import { getLookupBatch } from '../../database/parkingDB/getLookupBatch.js';
export const handler = (request, response) => {
    const batchID = Number.parseInt(request.body.batchID, 10);
    const result = clearLookupBatch(batchID, request.session.user);
    if (result.success) {
        result.batch = getLookupBatch(batchID);
    }
    return response.json(result);
};
export default handler;
