import createParkingTicketRemark from "../../helpers/parkingDB/createParkingTicketRemark.js";
export const handler = (req, res) => {
    const result = createParkingTicketRemark(req.body, req.session);
    return res.json(result);
};
export default handler;
