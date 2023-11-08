import { deleteParkingTicket } from '../../database/parkingDB/deleteParkingTicket.js';
export const handler = (request, response) => {
    const result = deleteParkingTicket(request.body.ticketId, request.session.user);
    return response.json(result);
};
export default handler;
