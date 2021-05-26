import * as parkingDB_ontario from "../../helpers/parkingDB-ontario.js";
import removeParkingTicketFromConvictionBatch from "../../helpers/parkingDB/removeParkingTicketFromConvictionBatch.js";
export const handler = (req, res) => {
    const batchID = req.body.batchID;
    const ticketID = req.body.ticketID;
    const result = removeParkingTicketFromConvictionBatch(batchID, ticketID, req.session);
    if (result.success) {
        result.tickets = parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch();
    }
    return res.json(result);
};
export default handler;
