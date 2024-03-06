import resolveParkingTicket from '../../database/parkingDB/resolveParkingTicket.js';
export default function handler(request, response) {
    const result = resolveParkingTicket(Number.parseInt(request.body.ticketId, 10), request.session.user);
    response.json(result);
}
