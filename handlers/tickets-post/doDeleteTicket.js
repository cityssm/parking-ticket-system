import deleteParkingTicket from '../../database/parkingDB/deleteParkingTicket.js';
export default function handler(request, response) {
    const result = deleteParkingTicket(Number.parseInt(request.body.ticketId, 10), request.session.user);
    response.json(result);
}
