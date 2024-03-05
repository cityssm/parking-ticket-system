import createParkingTicketRemark from '../../database/parkingDB/createParkingTicketRemark.js';
export default function handler(request, response) {
    const result = createParkingTicketRemark(request.body, request.session.user);
    response.json(result);
}
