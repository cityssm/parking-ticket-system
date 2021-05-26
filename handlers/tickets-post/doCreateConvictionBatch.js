import createConvictionBatch from "../../helpers/parkingDB/createConvictionBatch.js";
export const handler = (req, res) => {
    const batchResult = createConvictionBatch(req.session);
    return res.json(batchResult);
};
export default handler;
