import updateParkingTicketRemark from "../../helpers/parkingDB/updateParkingTicketRemark.js";
export const handler = (req, res) => {
    const result = updateParkingTicketRemark(req.body, req.session);
    return res.json(result);
};
export default handler;
