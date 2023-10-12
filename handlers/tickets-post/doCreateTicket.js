import * as configFunctions from '../../helpers/functions.config.js';
import { createParkingTicket } from '../../database/parkingDB/createParkingTicket.js';
export const handler = (request, response) => {
    const result = createParkingTicket(request.body, request.session);
    if (result.success) {
        const ticketNumber = request.body.ticketNumber;
        result.nextTicketNumber = configFunctions.getProperty('parkingTickets.ticketNumber.nextTicketNumberFn')(ticketNumber);
    }
    return response.json(result);
};
export default handler;
