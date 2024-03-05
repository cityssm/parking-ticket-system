import getLastTenConvictionBatches from '../../database/parkingDB/getLastTenConvictionBatches.js';
export default function handler(_request, response) {
    const batches = getLastTenConvictionBatches();
    response.json(batches);
}
