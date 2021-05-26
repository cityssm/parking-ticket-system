import getLookupBatch from "../../helpers/parkingDB/getLookupBatch.js";
import addLicencePlateToLookupBatch from "../../helpers/parkingDB/addLicencePlateToLookupBatch.js";
export const handler = (req, res) => {
    const result = addLicencePlateToLookupBatch(req.body, req.session);
    if (result.success) {
        result.batch = getLookupBatch(req.body.batchID);
    }
    return res.json(result);
};
export default handler;
