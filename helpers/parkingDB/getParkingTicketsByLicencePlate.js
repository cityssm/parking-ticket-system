"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingTicketsByLicencePlate = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
exports.getParkingTicketsByLicencePlate = (licencePlateCountry, licencePlateProvince, licencePlateNumber, reqSession) => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const tickets = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate," +
        " t.vehicleMakeModel," +
        " t.locationKey, l.locationName, l.locationClassKey, t.locationDescription," +
        " t.parkingOffence, t.offenceAmount, t.resolvedDate," +
        " s.statusDate as latestStatus_statusDate," +
        " s.statusKey as latestStatus_statusKey," +
        " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +
        " from ParkingTickets t" +
        " left join ParkingLocations l on t.locationKey = l.locationKey" +
        " left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
        (" and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID" +
            " order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)") +
        " where t.recordDelete_timeMillis is null" +
        " and t.licencePlateCountry = ?" +
        " and t.licencePlateProvince = ?" +
        " and t.licencePlateNumber = ?" +
        " order by t.issueDate desc, t.ticketNumber desc")
        .all(licencePlateCountry, licencePlateProvince, licencePlateNumber);
    db.close();
    for (const ticket of tickets) {
        ticket.recordType = "ticket";
        ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
        ticket.resolvedDateString = dateTimeFns.dateIntegerToString(ticket.resolvedDate);
        ticket.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(ticket.latestStatus_statusDate);
        ticket.canUpdate = parkingDB_1.canUpdateObject(ticket, reqSession);
    }
    return tickets;
};