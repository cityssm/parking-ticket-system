import { createConvictionBatch } from "../../helpers/parkingDB/createConvictionBatch.js";
export const handler = (request, response) => {
    const batchResult = createConvictionBatch(request.session);
    return response.json(batchResult);
};
export default handler;
