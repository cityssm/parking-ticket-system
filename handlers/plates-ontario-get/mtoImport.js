import getUnreceivedLookupBatches from "../../helpers/parkingDB/getUnreceivedLookupBatches.js";
export const handler = (_req, res) => {
    const unreceivedBatches = getUnreceivedLookupBatches(false);
    res.render("mto-plateImport", {
        headTitle: "MTO Licence Plate Ownership Import",
        batches: unreceivedBatches
    });
};
export default handler;
