import getParkingTicket from '../../database/parkingDB/getParkingTicket.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
const urlPrefix = getConfigProperty('reverseProxy.urlPrefix');
export default async function handler(request, response) {
    const ticketId = Number.parseInt(request.params.ticketId, 10);
    const ticket = await getParkingTicket(ticketId, request.session.user);
    if (!ticket) {
        response.redirect(`${urlPrefix}/tickets/?error=ticketNotFound`);
        return;
    }
    else if (ticket.recordDelete_timeMillis &&
        !(request.session.user.isAdmin ?? false)) {
        response.redirect(`${urlPrefix}/tickets/?error=accessDenied`);
        return;
    }
    response.render('ticket-view', {
        headTitle: `Ticket ${ticket.ticketNumber}`,
        ticket
    });
}
