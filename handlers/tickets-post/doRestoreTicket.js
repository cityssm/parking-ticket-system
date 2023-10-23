import { restoreParkingTicket } from '../../database/parkingDB/restoreParkingTicket.js';
export const handler = (request, response) => {
    const result = restoreParkingTicket(request.body.ticketID, request.session.user);
    return response.json(result);
};
export default handler;
