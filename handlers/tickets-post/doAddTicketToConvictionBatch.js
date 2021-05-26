import addParkingTicketToConvictionBatch from "../../helpers/parkingDB/addParkingTicketToConvictionBatch.js";
import getConvictionBatch from "../../helpers/parkingDB/getConvictionBatch.js";
export const handler = (req, res) => {
    const batchID = req.body.batchID;
    const ticketID = req.body.ticketID;
    const result = addParkingTicketToConvictionBatch(batchID, ticketID, req.session);
    if (result.success) {
        result.batch = getConvictionBatch(batchID);
    }
    return res.json(result);
};
