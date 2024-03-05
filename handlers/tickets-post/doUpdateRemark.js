import updateParkingTicketRemark from '../../database/parkingDB/updateParkingTicketRemark.js';
export default function handler(request, response) {
    const result = updateParkingTicketRemark(request.body, request.session.user);
    response.json(result);
}
