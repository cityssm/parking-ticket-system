import getParkingTicketStatuses from '../../database/parkingDB/getParkingTicketStatuses.js';
export default function handler(request, response) {
    response.json(getParkingTicketStatuses(Number.parseInt(request.body.ticketId, 10), request.session.user));
}
