import { updateParkingTicket } from '../../database/parkingDB/updateParkingTicket.js';
export const handler = (request, response) => {
    const result = updateParkingTicket(request.body, request.session.user);
    return response.json(result);
};
export default handler;
