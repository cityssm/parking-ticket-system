import resolveParkingTicket from "../../helpers/parkingDB/resolveParkingTicket.js";
export const handler = (req, res) => {
    const result = resolveParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
};
export default handler;
