import createLookupBatch from '../../database/parkingDB/createLookupBatch.js';
export default function handler(request, response) {
    const createBatchResponse = createLookupBatch(request.body, request.session.user);
    response.json(createBatchResponse);
}
