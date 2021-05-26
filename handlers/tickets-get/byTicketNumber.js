import getParkingTicketID from "../../helpers/parkingDB/getParkingTicketID.js";
export const handler = (req, res) => {
    const ticketNumber = req.params.ticketNumber;
    const ticketID = getParkingTicketID(ticketNumber);
    if (ticketID) {
        res.redirect("/tickets/" + ticketID.toString());
    }
    else {
        res.redirect("/tickets/?error=ticketNotFound");
    }
};
