import { restoreParkingTicket } from "../../helpers/parkingDB/restoreParkingTicket.js";
export const handler = (request, response) => {
    const result = restoreParkingTicket(request.body.ticketID, request.session);
    return response.json(result);
};
export default handler;
