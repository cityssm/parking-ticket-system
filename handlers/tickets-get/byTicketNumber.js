import { getParkingTicketId } from '../../database/parkingDB/getParkingTicketId.js';
export const handler = (request, response) => {
    const ticketNumber = request.params.ticketNumber;
    const ticketId = getParkingTicketId(ticketNumber);
    if (ticketId === undefined) {
        response.redirect('/tickets/?error=ticketNotFound');
    }
    else {
        response.redirect(`/tickets/${ticketId.toString()}`);
    }
};
export default handler;
