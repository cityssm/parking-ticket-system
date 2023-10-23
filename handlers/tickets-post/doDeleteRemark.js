import { deleteParkingTicketRemark } from '../../database/parkingDB/deleteParkingTicketRemark.js';
export const handler = (request, response) => {
    const result = deleteParkingTicketRemark(request.body.ticketID, request.body.remarkIndex, request.session.user);
    return response.json(result);
};
export default handler;
