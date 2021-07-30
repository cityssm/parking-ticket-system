import { unlockConvictionBatch } from "../../helpers/parkingDB/unlockConvictionBatch.js";
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const success = unlockConvictionBatch(batchID, request.session);
    return response.json({ success });
};
export default handler;
