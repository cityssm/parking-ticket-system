import getParkingTicketId from '../../database/parkingDB/getParkingTicketId.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
const urlPrefix = getConfigProperty('reverseProxy.urlPrefix');
export default function handler(request, response) {
    const ticketNumber = request.params.ticketNumber;
    const ticketId = getParkingTicketId(ticketNumber);
    if (ticketId === undefined) {
        response.redirect(`${urlPrefix}/tickets/?error=ticketNotFound`);
    }
    else {
        response.redirect(`${urlPrefix}/tickets/${ticketId.toString()}`);
    }
}
