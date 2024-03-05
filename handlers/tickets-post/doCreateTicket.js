import createParkingTicket from '../../database/parkingDB/createParkingTicket.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
export default function handler(request, response) {
    const result = createParkingTicket(request.body, request.session.user);
    if (result.success) {
        const ticketNumber = request.body.ticketNumber;
        result.nextTicketNumber = getConfigProperty('parkingTickets.ticketNumber.nextTicketNumberFn')(ticketNumber);
    }
    response.json(result);
}
