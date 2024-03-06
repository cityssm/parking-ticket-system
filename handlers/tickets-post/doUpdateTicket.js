import updateParkingTicket from '../../database/parkingDB/updateParkingTicket.js';
export default function handler(request, response) {
    const result = updateParkingTicket(request.body, request.session.user);
    response.json(result);
}
