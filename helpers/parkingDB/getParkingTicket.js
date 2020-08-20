"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingTicket = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.getParkingTicket = (ticketID, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath, {
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
        return ticket;
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
        ticket.licencePlateOwner = parkingDB_1.getLicencePlateOwnerWithDB(db, ticket.licencePlateCountry, ticket.licencePlateProvince, ticket.licencePlateNumber, parseInt(ticket.ownerLookup_statusField, 10));
    }
    ticket.location = parkingDB_1.getParkingLocationWithDB(db, ticket.locationKey);
    ticket.statusLog = db.prepare("select * from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by statusDate desc, statusTime desc, statusIndex desc")
        .all(ticketID);
    for (const statusObj of ticket.statusLog) {
        statusObj.statusDateString = dateTimeFns.dateIntegerToString(statusObj.statusDate);
        statusObj.statusTimeString = dateTimeFns.timeIntegerToString(statusObj.statusTime);
        if (!ticket.canUpdate) {
            statusObj.canUpdate = false;
        }
        else {
            statusObj.canUpdate = parkingDB_1.canUpdateObject(statusObj, reqSession);
        }
    }
    ticket.remarks = db.prepare("select * from ParkingTicketRemarks" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by remarkDate desc, remarkTime desc, remarkIndex desc")
        .all(ticketID);
    for (const remarkObj of ticket.remarks) {
        remarkObj.remarkDateString = dateTimeFns.dateIntegerToString(remarkObj.remarkDate);
        remarkObj.remarkTimeString = dateTimeFns.timeIntegerToString(remarkObj.remarkTime);
        if (!ticket.canUpdate) {
            remarkObj.canUpdate = false;
        }
        else {
            remarkObj.canUpdate = parkingDB_1.canUpdateObject(remarkObj, reqSession);
        }
    }
    db.close();
    return ticket;
};
