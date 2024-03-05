import deleteParkingTicketStatus from '../../database/parkingDB/deleteParkingTicketStatus.js';
export default function handler(request, response) {
    const result = deleteParkingTicketStatus(Number.parseInt(request.body.ticketId, 10), Number.parseInt(request.body.statusIndex, 10), request.session.user);
    response.json(result);
}
