import * as dateTimeFns from '@cityssm/utils-datetime';
import { getParkingTicket } from '../../database/parkingDB/getParkingTicket.js';
import * as parkingDB from '../../database/parkingDB.js';
export const handler = (request, response) => {
    const ticketId = Number.parseInt(request.params.ticketId, 10);
    const ticket = getParkingTicket(ticketId, request.session.user);
    if (!ticket) {
        response.redirect('/tickets/?error=ticketNotFound');
        return;
    }
    else if (!ticket.canUpdate ||
        ticket.resolvedDate ||
        ticket.recordDelete_timeMillis) {
        response.redirect(`/tickets/${ticketId.toString()}/?error=accessDenied`);
        return;
    }
    const vehicleMakeModelDatalist = parkingDB.getRecentParkingTicketVehicleMakeModelValues();
    response.render('ticket-edit', {
        headTitle: `Ticket ${ticket.ticketNumber}`,
        isCreate: false,
        ticket,
        issueDateMaxString: dateTimeFns.dateToString(new Date()),
        vehicleMakeModelDatalist
    });
};
export default handler;
