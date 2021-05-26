import getLookupBatch from "../../helpers/parkingDB/getLookupBatch.js";
export const handler = (req, res) => {
    const batch = getLookupBatch(req.body.batchID);
    return res.json(batch);
};
export default handler;
