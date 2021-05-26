import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import getParkingTicket from "../../helpers/parkingDB/getParkingTicket.js";
import * as parkingDB from "../../helpers/parkingDB.js";
export const handler = (req, res) => {
    const ticketID = parseInt(req.params.ticketID, 10);
    const ticket = getParkingTicket(ticketID, req.session);
    if (!ticket) {
        return res.redirect("/tickets/?error=ticketNotFound");
    }
    else if (!ticket.canUpdate || ticket.resolvedDate || ticket.recordDelete_timeMillis) {
        return res.redirect("/tickets/" + ticketID.toString() + "/?error=accessDenied");
    }
    const vehicleMakeModelDatalist = parkingDB.getRecentParkingTicketVehicleMakeModelValues();
    return res.render("ticket-edit", {
        headTitle: "Ticket " + ticket.ticketNumber,
        isCreate: false,
        ticket,
        issueDateMaxString: dateTimeFns.dateToString(new Date()),
        vehicleMakeModelDatalist
    });
};
export default handler;
