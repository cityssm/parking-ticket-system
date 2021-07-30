import { createLookupBatch } from "../../helpers/parkingDB/createLookupBatch.js";
export const handler = (request, response) => {
    const createBatchResponse = createLookupBatch(request.session);
    return response.json(createBatchResponse);
};
export default handler;
