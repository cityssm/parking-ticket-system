import { getParkingTicketStatuses } from '../../database/parkingDB/getParkingTicketStatuses.js';
export const handler = (request, response) => {
    return response.json(getParkingTicketStatuses(request.body.ticketID, request.session.user));
};
export default handler;
