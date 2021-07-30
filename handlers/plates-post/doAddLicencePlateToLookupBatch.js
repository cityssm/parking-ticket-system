import { getLookupBatch } from "../../helpers/parkingDB/getLookupBatch.js";
import { addLicencePlateToLookupBatch } from "../../helpers/parkingDB/addLicencePlateToLookupBatch.js";
export const handler = (request, response) => {
    const result = addLicencePlateToLookupBatch(request.body, request.session);
    if (result.success) {
        result.batch = getLookupBatch(request.body.batchID);
    }
    return response.json(result);
};
export default handler;
