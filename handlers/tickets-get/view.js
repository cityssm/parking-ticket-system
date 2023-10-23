import { getParkingTicket } from '../../database/parkingDB/getParkingTicket.js';
export const handler = (request, response) => {
    const ticketID = Number.parseInt(request.params.ticketID, 10);
    const ticket = getParkingTicket(ticketID, request.session.user);
    if (!ticket) {
        response.redirect('/tickets/?error=ticketNotFound');
        return;
    }
    else if (ticket.recordDelete_timeMillis &&
        !(request.session.user.isAdmin ?? false)) {
        response.redirect('/tickets/?error=accessDenied');
        return;
    }
    response.render('ticket-view', {
        headTitle: 'Ticket ' + ticket.ticketNumber,
        ticket
    });
};
export default handler;
