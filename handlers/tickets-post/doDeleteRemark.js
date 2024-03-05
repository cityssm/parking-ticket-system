import deleteParkingTicketRemark from '../../database/parkingDB/deleteParkingTicketRemark.js';
export default function handler(request, response) {
    const result = deleteParkingTicketRemark(Number.parseInt(request.body.ticketId, 10), Number.parseInt(request.body.remarkIndex, 10), request.session.user);
    response.json(result);
}
