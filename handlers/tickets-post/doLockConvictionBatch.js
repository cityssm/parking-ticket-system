import { lockConvictionBatch } from "../../helpers/parkingDB/lockConvictionBatch.js";
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const result = lockConvictionBatch(batchID, request.session);
    return response.json(result);
};
export default handler;
