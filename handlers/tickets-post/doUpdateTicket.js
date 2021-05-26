import updateParkingTicket from "../../helpers/parkingDB/updateParkingTicket.js";
export const handler = (req, res) => {
    const result = updateParkingTicket(req.body, req.session);
    return res.json(result);
};
export default handler;
