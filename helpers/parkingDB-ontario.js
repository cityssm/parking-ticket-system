"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingTicketsAvailableForMTOConvictionBatch = exports.getLicencePlatesAvailableForMTOLookupBatch = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../data/databasePaths");
exports.getLicencePlatesAvailableForMTOLookupBatch = (currentBatchID, issueDaysAgo) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    let issueDateNumber = 1e8;
    if (issueDaysAgo !== -1) {
        const issueDate = new Date();
        issueDate.setDate(issueDate.getDate() - issueDaysAgo);
        issueDateNumber = dateTimeFns.dateToInteger(issueDate);
    }
    const plates = db.prepare("select t.licencePlateNumber," +
        " min(t.ticketID) as ticketIDMin," +
        " count(t.ticketID) as ticketCount," +
        " group_concat(t.ticketNumber, ':') as ticketNumbersConcat," +
        " min(t.issueDate) as issueDateMin," +
        " max(t.issueDate) as issueDateMax" +
        " from ParkingTickets t" +
        (" left join LicencePlateLookupBatchEntries e" +
            " on t.licencePlateNumber = e.licencePlateNumber and (t.ticketID = e.ticketID or e.batchID = ?)") +
        " where t.recordDelete_timeMillis is null" +
        " and t.licencePlateCountry = 'CA'" +
        " and t.licencePlateProvince = 'ON'" +
        " and t.licencePlateNumber != ''" +
        " and t.resolvedDate is null" +
        " and e.batchID is null" +
        (" and not exists (" +
            "select 1 from ParkingTicketStatusLog s" +
            " where t.ticketID = s.ticketID and s.recordDelete_timeMillis is null" +
            " and s.statusKey in ('ownerLookupPending', 'ownerLookupMatch', 'ownerLookupError'))") +
        " and t.issueDate <= ?" +
        " group by t.licencePlateNumber" +
        " order by t.licencePlateNumber")
        .all(currentBatchID, issueDateNumber);
    db.close();
    for (const plateRecord of plates) {
        plateRecord.issueDateMinString = dateTimeFns.dateIntegerToString(plateRecord.issueDateMin);
        plateRecord.issueDateMaxString = dateTimeFns.dateIntegerToString(plateRecord.issueDateMax);
        plateRecord.ticketNumbers = plateRecord.ticketNumbersConcat.split(":");
        delete plateRecord.ticketNumbersConcat;
    }
    return plates;
};
exports.getParkingTicketsAvailableForMTOConvictionBatch = () => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - 60);
    const issueDateNumber = dateTimeFns.dateToInteger(issueDate);
    const parkingTickets = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate, t.licencePlateNumber," +
        " o.ownerName1 as licencePlateOwner_ownerName1" +
        " from ParkingTickets t" +
        (" inner join ParkingTicketStatusLog ol on t.ticketID = ol.ticketID" +
            " and ol.recordDelete_timeMillis is null" +
            " and ol.statusKey = 'ownerLookupMatch'") +
        (" left join LicencePlateOwners o" +
            " on t.licencePlateCountry = o.licencePlateCountry" +
            " and t.licencePlateProvince = o.licencePlateProvince" +
            " and t.licencePlateNumber = o.licencePlateNumber" +
            " and ol.statusField = o.recordDate" +
            " and o.recordDelete_timeMillis is null") +
        " where t.recordDelete_timeMillis is null" +
        " and t.licencePlateCountry = 'CA'" +
        " and t.licencePlateProvince = 'ON'" +
        " and t.licencePlateNumber != ''" +
        " and t.issueDate <= ?" +
        (" and not exists (" +
            "select 1 from ParkingTicketStatusLog s" +
            " where t.ticketID = s.ticketID" +
            " and s.recordDelete_timeMillis is null" +
            " and s.statusKey in ('trial', 'convictionBatch')" +
            ")") +
        (" and (" +
            "t.resolvedDate is null" +
            " or exists (" +
            "select 1 from ParkingTicketStatusLog s" +
            " where t.ticketID = s.ticketID" +
            " and s.recordDelete_timeMillis is null" +
            " and s.statusKey = 'convicted'" +
            ")" +
            ")") +
        " order by ticketNumber")
        .all(issueDateNumber);
    db.close();
    for (const ticket of parkingTickets) {
        ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
    }
    return parkingTickets;
};
