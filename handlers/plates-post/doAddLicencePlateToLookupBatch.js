import { addLicencePlateToLookupBatch } from '../../database/parkingDB/addLicencePlateToLookupBatch.js';
import getLookupBatch from '../../database/parkingDB/getLookupBatch.js';
export default function handler(request, response) {
    const result = addLicencePlateToLookupBatch(request.body, request.session.user);
    if (result.success) {
        result.batch = getLookupBatch(Number.parseInt(request.body.batchId, 10));
    }
    response.json(result);
}
