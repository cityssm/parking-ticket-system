import removeLicencePlateFromLookupBatch from "../../helpers/parkingDB/removeLicencePlateFromLookupBatch.js";
export const handler = (req, res) => {
    const result = removeLicencePlateFromLookupBatch(req.body, req.session);
    return res.json(result);
};
export default handler;
