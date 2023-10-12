import { createParkingTicketRemark } from '../../database/parkingDB/createParkingTicketRemark.js';
export const handler = (request, response) => {
    const result = createParkingTicketRemark(request.body, request.session);
    return response.json(result);
};
export default handler;
