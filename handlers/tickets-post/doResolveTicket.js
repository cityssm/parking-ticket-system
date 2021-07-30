import { resolveParkingTicket } from "../../helpers/parkingDB/resolveParkingTicket.js";
export const handler = (request, response) => {
    const result = resolveParkingTicket(request.body.ticketID, request.session);
    return response.json(result);
};
export default handler;
