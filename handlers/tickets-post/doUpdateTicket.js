import { updateParkingTicket } from "../../helpers/parkingDB/updateParkingTicket.js";
export const handler = (request, response) => {
    const result = updateParkingTicket(request.body, request.session);
    return response.json(result);
};
export default handler;
