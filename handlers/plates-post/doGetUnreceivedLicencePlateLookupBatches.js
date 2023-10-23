import { getUnreceivedLookupBatches } from '../../database/parkingDB/getUnreceivedLookupBatches.js';
export const handler = (request, response) => {
    const batches = getUnreceivedLookupBatches(request.session.user.canUpdate ?? false);
    return response.json(batches);
};
export default handler;
