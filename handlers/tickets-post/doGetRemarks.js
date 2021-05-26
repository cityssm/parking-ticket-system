import getParkingTicketRemarks from "../../helpers/parkingDB/getParkingTicketRemarks.js";
export const handler = (req, res) => {
    return res.json(getParkingTicketRemarks(req.body.ticketID, req.session));
};
export default handler;
