import { getUnreceivedLookupBatches } from "../../helpers/parkingDB/getUnreceivedLookupBatches.js";
export const handler = (request, response) => {
    const batches = getUnreceivedLookupBatches(request.session.user.userProperties.canUpdate);
    return response.json(batches);
};
export default handler;
