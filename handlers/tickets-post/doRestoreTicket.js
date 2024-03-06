import restoreParkingTicket from '../../database/parkingDB/restoreParkingTicket.js';
export default function handler(request, response) {
    const result = restoreParkingTicket(Number.parseInt(request.body.ticketId, 10), request.session.user);
    response.json(result);
}
