import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js';
export const handler = (request, response) => {
    const result = createParkingTicketStatus(request.body, request.session.user, request.body.resolveTicket === '1');
    return response.json(result);
};
export default handler;
