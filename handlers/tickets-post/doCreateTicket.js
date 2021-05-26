import * as configFns from "../../helpers/configFns.js";
import createParkingTicket from "../../helpers/parkingDB/createParkingTicket.js";
export const handler = (req, res) => {
    const result = createParkingTicket(req.body, req.session);
    if (result.success) {
        const ticketNumber = req.body.ticketNumber;
        result.nextTicketNumber = configFns.getProperty("parkingTickets.ticketNumber.nextTicketNumberFn")(ticketNumber);
    }
    return res.json(result);
};
export default handler;
