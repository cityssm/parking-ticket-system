import updateParkingTicketStatus from '../../database/parkingDB/updateParkingTicketStatus.js';
export default function handler(request, response) {
    const result = updateParkingTicketStatus(request.body, request.session.user);
    response.json(result);
}
