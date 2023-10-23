import { updateParkingTicketStatus } from '../../database/parkingDB/updateParkingTicketStatus.js';
export const handler = (request, response) => {
    const result = updateParkingTicketStatus(request.body, request.session.user);
    return response.json(result);
};
export default handler;
