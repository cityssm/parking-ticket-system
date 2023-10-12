import { unresolveParkingTicket } from '../../database/parkingDB/unresolveParkingTicket.js';
export const handler = (request, response) => {
    const result = unresolveParkingTicket(request.body.ticketID, request.session);
    return response.json(result);
};
export default handler;
