import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js';
export default function handler(request, response) {
    const result = createParkingTicketStatus(request.body, request.session.user, request.body.resolveTicket === '1');
    response.json(result);
}
