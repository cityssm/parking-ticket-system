import { getLookupBatch } from "../../helpers/parkingDB/getLookupBatch.js";
import { clearLookupBatch } from "../../helpers/parkingDB/clearLookupBatch.js";
export const handler = (request, response) => {
    const batchID = Number.parseInt(request.body.batchID, 10);
    const result = clearLookupBatch(batchID, request.session);
    if (result.success) {
        result.batch = getLookupBatch(batchID);
    }
    return response.json(result);
};
export default handler;
