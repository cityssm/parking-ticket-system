import { getParkingTicketRemarks } from '../../database/parkingDB/getParkingTicketRemarks.js';
export const handler = (request, response) => {
    return response.json(getParkingTicketRemarks(request.body.ticketID, request.session));
};
export default handler;
