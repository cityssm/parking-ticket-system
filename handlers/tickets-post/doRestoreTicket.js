import restoreParkingTicket from "../../helpers/parkingDB/restoreParkingTicket.js";
export const handler = (req, res) => {
    const result = restoreParkingTicket(req.body.ticketID, req.session);
    return res.json(result);
};
export default handler;
