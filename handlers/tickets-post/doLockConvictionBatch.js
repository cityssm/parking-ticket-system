import lockConvictionBatch from "../../helpers/parkingDB/lockConvictionBatch.js";
export const handler = (req, res) => {
    const batchID = req.body.batchID;
    const result = lockConvictionBatch(batchID, req.session);
    return res.json(result);
};
export default handler;
