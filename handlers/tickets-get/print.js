import { getParkingTicket } from '../../database/parkingDB/getParkingTicket.js';
export async function handler(request, response) {
    const ticketId = Number.parseInt(request.params.ticketId, 10);
    const ticket = await getParkingTicket(ticketId, request.session.user);
    if (!ticket) {
        response.redirect('/tickets/?error=ticketNotFound');
        return;
    }
    else if (ticket.recordDelete_timeMillis) {
        response.redirect('/tickets/?error=accessDenied');
        return;
    }
    response.render('ticket-print', {
        headTitle: `Ticket ${ticket.ticketNumber}`,
        ticket
    });
}
export default handler;
