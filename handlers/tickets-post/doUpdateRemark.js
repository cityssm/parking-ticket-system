import { updateParkingTicketRemark } from '../../database/parkingDB/updateParkingTicketRemark.js';
export const handler = (request, response) => {
    const result = updateParkingTicketRemark(request.body, request.session);
    return response.json(result);
};
export default handler;
