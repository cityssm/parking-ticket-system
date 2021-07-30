import { getLookupBatch } from "../../helpers/parkingDB/getLookupBatch.js";
export const handler = (_request, response) => {
    const latestUnlockedBatch = getLookupBatch(-1);
    response.render("mto-plateExport", {
        headTitle: "MTO Licence Plate Export",
        batch: latestUnlockedBatch
    });
};
export default handler;
