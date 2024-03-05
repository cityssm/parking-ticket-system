import createConvictionBatch from '../../database/parkingDB/createConvictionBatch.js';
export default function handler(request, response) {
    const batchResult = createConvictionBatch(request.session.user);
    response.json(batchResult);
}
