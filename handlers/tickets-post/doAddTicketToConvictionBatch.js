import { addParkingTicketToConvictionBatch } from "../../helpers/parkingDB/addParkingTicketToConvictionBatch.js";
import { getConvictionBatch } from "../../helpers/parkingDB/getConvictionBatch.js";
export const handler = (request, response) => {
    const batchID = request.body.batchID;
    const ticketID = request.body.ticketID;
    const result = addParkingTicketToConvictionBatch(batchID, ticketID, request.session);
    if (result.success) {
        result.batch = getConvictionBatch(batchID);
    }
    return response.json(result);
};
export default handler;
