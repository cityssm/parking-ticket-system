import { getParkingTicket } from '../../database/parkingDB/getParkingTicket.js';
export const handler = (request, response) => {
    const ticketID = Number.parseInt(request.params.ticketID, 10);
    const ticket = getParkingTicket(ticketID, request.session);
    if (!ticket) {
        return response.redirect('/tickets/?error=ticketNotFound');
    }
    else if (ticket.recordDelete_timeMillis) {
        return response.redirect('/tickets/?error=accessDenied');
    }
    return response.render('ticket-print', {
        headTitle: 'Ticket ' + ticket.ticketNumber,
        ticket
    });
};
export default handler;
