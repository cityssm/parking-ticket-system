import getParkingTicketRemarks from '../../database/parkingDB/getParkingTicketRemarks.js';
export default function handler(request, response) {
    response.json(getParkingTicketRemarks(Number.parseInt(request.body.ticketId, 10), request.session.user));
}
