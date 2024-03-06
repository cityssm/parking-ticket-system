import unresolveParkingTicket from '../../database/parkingDB/unresolveParkingTicket.js';
export default function handler(request, response) {
    const result = unresolveParkingTicket(Number.parseInt(request.body.ticketId, 10), request.session.user);
    response.json(result);
}
