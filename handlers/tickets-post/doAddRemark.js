import createParkingTicketRemark from '../../database/parkingDB/createParkingTicketRemark.js';
import getParkingTicketRemarks from '../../database/parkingDB/getParkingTicketRemarks.js';
export default function handler(request, response) {
    const remarkIndex = createParkingTicketRemark(request.body, request.session.user);
    const remarks = getParkingTicketRemarks(Number.parseInt(request.body.ticketId, 10), request.session.user);
    const json = {
        remarkIndex,
        remarks
    };
    response.json(json);
}
