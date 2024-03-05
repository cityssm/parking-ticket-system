import { dateToString } from '@cityssm/utils-datetime';
import getParkingTicket from '../../database/parkingDB/getParkingTicket.js';
import { getRecentParkingTicketVehicleMakeModelValues } from '../../database/parkingDB.js';
export default async function handler(request, response) {
    const ticketId = Number.parseInt(request.params.ticketId, 10);
    const ticket = await getParkingTicket(ticketId, request.session.user);
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
    const vehicleMakeModelDatalist = getRecentParkingTicketVehicleMakeModelValues();
    response.render('ticket-edit', {
        headTitle: `Ticket ${ticket.ticketNumber}`,
        isCreate: false,
        ticket,
        issueDateMaxString: dateToString(new Date()),
        vehicleMakeModelDatalist
    });
}
