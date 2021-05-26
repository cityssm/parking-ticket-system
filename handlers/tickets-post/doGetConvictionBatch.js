import getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch.js";
export const handler = (req, res) => {
    const batch = getConvictionBatch(req.body.batchID);
    return res.json(batch);
};
export default handler;
