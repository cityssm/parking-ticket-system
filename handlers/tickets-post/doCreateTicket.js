import { createParkingTicket } from '../../database/parkingDB/createParkingTicket.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
export const handler = (request, response) => {
    const result = createParkingTicket(request.body, request.session.user);
    if (result.success) {
        const ticketNumber = request.body.ticketNumber;
        result.nextTicketNumber = getConfigProperty('parkingTickets.ticketNumber.nextTicketNumberFn')(ticketNumber);
    }
    return response.json(result);
};
export default handler;
