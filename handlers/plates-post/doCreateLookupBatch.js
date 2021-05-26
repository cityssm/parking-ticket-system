import createLookupBatch from "../../helpers/parkingDB/createLookupBatch.js";
export const handler = (req, res) => {
    const createBatchResponse = createLookupBatch(req.session);
    return res.json(createBatchResponse);
};
export default handler;
