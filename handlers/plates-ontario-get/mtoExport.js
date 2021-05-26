import getLookupBatch from "../../helpers/parkingDB/getLookupBatch.js";
export const handler = (_req, res) => {
    const latestUnlockedBatch = getLookupBatch(-1);
    res.render("mto-plateExport", {
        headTitle: "MTO Licence Plate Export",
        batch: latestUnlockedBatch
    });
};
export default handler;
