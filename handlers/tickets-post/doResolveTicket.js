import { resolveParkingTicket } from '../../database/parkingDB/resolveParkingTicket.js';
export const handler = (request, response) => {
    const result = resolveParkingTicket(request.body.ticketID, request.session.user);
    return response.json(result);
};
export default handler;
