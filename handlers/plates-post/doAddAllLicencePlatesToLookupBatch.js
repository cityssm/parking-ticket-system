import { addAllLicencePlatesToLookupBatch } from "../../helpers/parkingDB/addLicencePlateToLookupBatch.js";
export const handler = (req, res) => {
    const result = addAllLicencePlatesToLookupBatch(req.body, req.session);
    return res.json(result);
};
export default handler;
