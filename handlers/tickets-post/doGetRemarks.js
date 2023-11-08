import { getParkingTicketRemarks } from '../../database/parkingDB/getParkingTicketRemarks.js';
export const handler = (request, response) => {
    return response.json(getParkingTicketRemarks(request.body.ticketId, request.session.user));
};
export default handler;
