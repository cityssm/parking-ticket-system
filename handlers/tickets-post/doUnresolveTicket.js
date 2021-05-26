import unresolveParkingTicket from "../../helpers/parkingDB/unresolveParkingTicket.js";
export const handler = (req, res) => {
    const result = unresolveParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
};
export default handler;
