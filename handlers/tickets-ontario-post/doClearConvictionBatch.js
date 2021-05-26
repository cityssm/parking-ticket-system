import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";
import clearConvictionBatch from "../../helpers/parkingDB/clearConvictionBatch.js";
import getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch.js";
export const handler = (req, res) => {
    const batchID = req.body.batchID;
    const result = clearConvictionBatch(batchID, req.session);
    if (result.success) {
        result.batch = getConvictionBatch(batchID);
        result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
};
export default handler;
