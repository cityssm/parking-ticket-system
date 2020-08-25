"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingTicket = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
const getParkingLocation_1 = require("./getParkingLocation");
const getLicencePlateOwner_1 = require("./getLicencePlateOwner");
const getParkingTicketRemarks_1 = require("./getParkingTicketRemarks");
const getParkingTicketStatuses_1 = require("./getParkingTicketStatuses");
const databasePaths_1 = require("../../data/databasePaths");
exports.getParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB, {
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
    ticket.canUpdate = parkingDB_1.canUpdateObject(ticket, reqSession);
    if (ticket.ownerLookup_statusKey === "ownerLookupMatch") {
        ticket.licencePlateOwner = getLicencePlateOwner_1.getLicencePlateOwnerWithDB(db, ticket.licencePlateCountry, ticket.licencePlateProvince, ticket.licencePlateNumber, parseInt(ticket.ownerLookup_statusField, 10));
    }
    ticket.location = getParkingLocation_1.getParkingLocationWithDB(db, ticket.locationKey);
    ticket.statusLog = getParkingTicketStatuses_1.getParkingTicketStatusesWithDB(db, ticketID, reqSession);
    if (!ticket.canUpdate) {
        for (const status of ticket.statusLog) {
            status.canUpdate = false;
        }
    }
    ticket.remarks = getParkingTicketRemarks_1.getParkingTicketRemarksWithDB(db, ticketID, reqSession);
    if (!ticket.canUpdate) {
        for (const remark of ticket.remarks) {
            remark.canUpdate = false;
        }
    }
    db.close();
    return ticket;
};
