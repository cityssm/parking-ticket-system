import deleteParkingTicketRemark from "../../helpers/parkingDB/deleteParkingTicketRemark.js";
export const handler = (req, res) => {
    const result = deleteParkingTicketRemark(req.body.ticketID, req.body.remarkIndex, req.session);
    return res.json(result);
};
export default handler;
