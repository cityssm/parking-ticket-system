import getUnreceivedLookupBatches from '../../database/parkingDB/getUnreceivedLookupBatches.js';
export default function handler(request, response) {
    const batches = getUnreceivedLookupBatches(request.session.user.canUpdate ?? false);
    response.json(batches);
}
