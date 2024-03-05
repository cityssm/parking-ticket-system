import { addLicencePlateToLookupBatch } from '../../database/parkingDB/addLicencePlateToLookupBatch.js';
import getLookupBatch from '../../database/parkingDB/getLookupBatch.js';
export const handler = (request, response) => {
    const result = addLicencePlateToLookupBatch(request.body, request.session.user);
    if (result.success) {
        result.batch = getLookupBatch(Number.parseInt(request.body.batchId, 10));
    }
    return response.json(result);
};
export default handler;
