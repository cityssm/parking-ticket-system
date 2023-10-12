import { deleteParkingTicketStatus } from '../../database/parkingDB/deleteParkingTicketStatus.js';
export const handler = (request, response) => {
    const result = deleteParkingTicketStatus(request.body.ticketID, request.body.statusIndex, request.session);
    return response.json(result);
};
export default handler;
