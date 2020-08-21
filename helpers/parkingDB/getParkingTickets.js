"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingTicketsByLicencePlate = exports.getParkingTickets = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
const databasePaths_1 = require("../../data/databasePaths");
exports.getParkingTickets = (reqSession, queryOptions) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const sqlParams = [];
    let sqlWhereClause = " where t.recordDelete_timeMillis is null";
    if (queryOptions.hasOwnProperty("isResolved")) {
        if (queryOptions.isResolved) {
            sqlWhereClause += " and t.resolvedDate is not null";
        }
        else {
            sqlWhereClause += " and t.resolvedDate is null";
        }
    }
    if (queryOptions.ticketNumber && queryOptions.ticketNumber !== "") {
        const ticketNumberPieces = queryOptions.ticketNumber.toLowerCase().split(" ");
        for (const ticketNumberPiece of ticketNumberPieces) {
            sqlWhereClause += " and instr(lower(t.ticketNumber), ?)";
            sqlParams.push(ticketNumberPiece);
        }
    }
    if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {
        const licencePlateNumberPieces = queryOptions.licencePlateNumber.toLowerCase().split(" ");
        for (const licencePlateNumberPiece of licencePlateNumberPieces) {
            sqlWhereClause += " and instr(lower(t.licencePlateNumber), ?)";
            sqlParams.push(licencePlateNumberPiece);
        }
    }
    if (queryOptions.location && queryOptions.location !== "") {
        const locationPieces = queryOptions.location.toLowerCase().split(" ");
        for (const locationPiece of locationPieces) {
            sqlWhereClause += " and (instr(lower(t.locationDescription), ?) or instr(lower(l.locationName), ?))";
            sqlParams.push(locationPiece);
            sqlParams.push(locationPiece);
        }
    }
    const count = db.prepare("select ifnull(count(*), 0) as cnt" +
        " from ParkingTickets t" +
        " left join ParkingLocations l on t.locationKey = l.locationKey" +
        sqlWhereClause)
        .get(sqlParams)
        .cnt;
    const rows = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate," +
        " t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber, t.licencePlateIsMissing," +
        " t.locationKey, l.locationName, l.locationClassKey, t.locationDescription," +
        " t.parkingOffence, t.offenceAmount, t.resolvedDate," +
        " s.statusDate as latestStatus_statusDate," +
        " s.statusKey as latestStatus_statusKey," +
        " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +
        " from ParkingTickets t" +
        " left join ParkingLocations l on t.locationKey = l.locationKey" +
        " left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
        (" and s.statusIndex = (" +
            "select statusIndex from ParkingTicketStatusLog s" +
            " where t.ticketID = s.ticketID" +
            " and s.recordDelete_timeMillis is null" +
            " order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)") +
        sqlWhereClause +
        " order by t.issueDate desc, t.ticketNumber desc" +
        " limit " + queryOptions.limit.toString() +
        " offset " + queryOptions.offset.toString())
        .all(sqlParams);
    db.close();
    for (const ticket of rows) {
        ticket.recordType = "ticket";
        ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
        ticket.resolvedDateString = dateTimeFns.dateIntegerToString(ticket.resolvedDate);
        ticket.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(ticket.latestStatus_statusDate);
        ticket.canUpdate = parkingDB_1.canUpdateObject(ticket, reqSession);
    }
    return {
        count,
        tickets: rows
    };
};
exports.getParkingTicketsByLicencePlate = (licencePlateCountry, licencePlateProvince, licencePlateNumber, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB, {
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
