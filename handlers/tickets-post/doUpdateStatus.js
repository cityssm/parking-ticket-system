import updateParkingTicketStatus from "../../helpers/parkingDB/updateParkingTicketStatus.js";
export const handler = (req, res) => {
    const result = updateParkingTicketStatus(req.body, req.session);
    return res.json(result);
};
export default handler;
