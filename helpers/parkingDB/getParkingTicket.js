import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { canUpdateObject } from "../parkingDB.js";
import { getParkingLocationWithDB } from "./getParkingLocation.js";
import { getLicencePlateOwnerWithDB } from "./getLicencePlateOwner.js";
import { getParkingTicketRemarksWithDB } from "./getParkingTicketRemarks.js";
import { getParkingTicketStatusesWithDB } from "./getParkingTicketStatuses.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const getParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(dbPath, {
        readonly: true
    });
    const ticket = db.prepare("select t.*," +
        " l.locationName," +
        " s.statusKey as ownerLookup_statusKey," +
        " s.statusField as ownerLookup_statusField" +
        " from ParkingTickets t" +
        (" left join ParkingTicketStatusLog s" +
            " on t.ticketID = s.ticketID" +
            " and s.statusKey in ('ownerLookupPending', 'ownerLookupError', 'ownerLookupMatch')" +
            " and s.recordDelete_timeMillis is null") +
        (" left join ParkingLocations l" +
            " on t.locationKey = l.locationKey") +
        " where t.ticketID = ?" +
        " order by s.statusDate desc, s.statusIndex desc" +
        " limit 1")
        .get(ticketID);
    if (!ticket) {
        db.close();
        return null;
    }
    ticket.recordType = "ticket";
    ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
    ticket.issueTimeString = dateTimeFns.timeIntegerToString(ticket.issueTime);
    ticket.licencePlateExpiryDateString = dateTimeFns.dateIntegerToString(ticket.licencePlateExpiryDate);
    if (ticket.licencePlateExpiryDateString !== "") {
        ticket.licencePlateExpiryYear = parseInt(ticket.licencePlateExpiryDateString.substring(0, 4), 10);
        ticket.licencePlateExpiryMonth = parseInt(ticket.licencePlateExpiryDateString.substring(5, 7), 10);
    }
    ticket.resolvedDateString = dateTimeFns.dateIntegerToString(ticket.resolvedDate);
    ticket.canUpdate = canUpdateObject(ticket, reqSession);
    if (ticket.ownerLookup_statusKey === "ownerLookupMatch") {
        ticket.licencePlateOwner = getLicencePlateOwnerWithDB(db, ticket.licencePlateCountry, ticket.licencePlateProvince, ticket.licencePlateNumber, parseInt(ticket.ownerLookup_statusField, 10));
    }
    ticket.location = getParkingLocationWithDB(db, ticket.locationKey);
    ticket.statusLog = getParkingTicketStatusesWithDB(db, ticketID, reqSession);
    if (!ticket.canUpdate) {
        for (const status of ticket.statusLog) {
            status.canUpdate = false;
        }
    }
    ticket.remarks = getParkingTicketRemarksWithDB(db, ticketID, reqSession);
    if (!ticket.canUpdate) {
        for (const remark of ticket.remarks) {
            remark.canUpdate = false;
        }
    }
    db.close();
    return ticket;
};
export default getParkingTicket;
