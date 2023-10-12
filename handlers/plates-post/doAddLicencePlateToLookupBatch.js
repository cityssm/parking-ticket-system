import { getLookupBatch } from '../../database/parkingDB/getLookupBatch.js';
import { addLicencePlateToLookupBatch } from '../../database/parkingDB/addLicencePlateToLookupBatch.js';
export const handler = (request, response) => {
    const result = addLicencePlateToLookupBatch(request.body, request.session);
    if (result.success) {
        result.batch = getLookupBatch(request.body.batchID);
    }
    return response.json(result);
};
export default handler;
