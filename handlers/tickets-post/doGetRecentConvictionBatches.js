import { getLastTenConvictionBatches } from '../../database/parkingDB/getLastTenConvictionBatches.js';
export const handler = (_request, response) => {
    const batches = getLastTenConvictionBatches();
    return response.json(batches);
};
export default handler;
