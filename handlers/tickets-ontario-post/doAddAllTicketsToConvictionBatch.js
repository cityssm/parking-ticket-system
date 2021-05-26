import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";
import { addAllParkingTicketsToConvictionBatch } from "../../helpers/parkingDB/addParkingTicketToConvictionBatch.js";
import getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch.js";
export const handler = (req, res) => {
    const batchID = req.body.batchID;
    const ticketIDs = req.body.ticketIDs;
    const result = addAllParkingTicketsToConvictionBatch(batchID, ticketIDs, req.session);
    if (result.successCount > 0) {
        result.batch = getConvictionBatch(batchID);
        result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
};
export default handler;
