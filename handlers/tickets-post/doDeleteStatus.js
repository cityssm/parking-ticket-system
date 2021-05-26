import deleteParkingTicketStatus from "../../helpers/parkingDB/deleteParkingTicketStatus.js";
export const handler = (req, res) => {
    const result = deleteParkingTicketStatus(req.body.ticketID, req.body.statusIndex, req.session);
    return res.json(result);
};
export default handler;
