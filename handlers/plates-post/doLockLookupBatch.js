import { getLookupBatch } from "../../helpers/parkingDB/getLookupBatch.js";
import { lockLookupBatch } from "../../helpers/parkingDB/lockLookupBatch.js";
export const handler = (request, response) => {
    const batchID = Number.parseInt(request.body.batchID, 10);
    const result = lockLookupBatch(batchID, request.session);
    if (result.success) {
        result.batch = getLookupBatch(batchID);
    }
    return response.json(result);
};
export default handler;
