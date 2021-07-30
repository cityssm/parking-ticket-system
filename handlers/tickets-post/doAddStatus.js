import { createParkingTicketStatus } from "../../helpers/parkingDB/createParkingTicketStatus.js";
export const handler = (request, response) => {
    const result = createParkingTicketStatus(request.body, request.session, request.body.resolveTicket === "1");
    return response.json(result);
};
export default handler;
