import getLookupBatch from "../../helpers/parkingDB/getLookupBatch.js";
import lockLookupBatch from "../../helpers/parkingDB/lockLookupBatch.js";
export const handler = (req, res) => {
    const batchID = parseInt(req.body.batchID, 10);
    const result = lockLookupBatch(batchID, req.session);
    if (result.success) {
        result.batch = getLookupBatch(batchID);
    }
    return res.json(result);
};
export default handler;
