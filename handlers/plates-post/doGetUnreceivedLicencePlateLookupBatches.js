import getUnreceivedLookupBatches from "../../helpers/parkingDB/getUnreceivedLookupBatches.js";
export const handler = (req, res) => {
    const batches = getUnreceivedLookupBatches(req.session.user.userProperties.canUpdate);
    return res.json(batches);
};
export default handler;
