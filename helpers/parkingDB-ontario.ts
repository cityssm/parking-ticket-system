import { dbPath } from "./parkingDB";
import type { ParkingTicket } from "./ptsTypes";

import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";


type MTO_AvailableLicencePlate = {
  licencePlateNumber: string,
  ticketIDMin: number,
  ticketCount: number,
  issueDateMin: number,
  issueDateMinString: string,
  issueDateMax: number,
  issueDateMaxString: string,
  ticketNumbersConcat: string,
  ticketNumbers: string[]
};


export const getLicencePlatesAvailableForMTOLookupBatch = (currentBatchID: number, issueDaysAgo: number) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  let issueDateNumber = 99999999;

  if (issueDaysAgo !== -1) {
    let issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - issueDaysAgo);
    issueDateNumber = dateTimeFns.dateToInteger(issueDate);
  }

  const plates: MTO_AvailableLicencePlate[] = db.prepare("select t.licencePlateNumber," +
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


export const getParkingTicketsAvailableForMTOConvictionBatch = () => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  let issueDate = new Date();
  issueDate.setDate(issueDate.getDate() - 60);
  const issueDateNumber = dateTimeFns.dateToInteger(issueDate);

  const parkingTickets: ParkingTicket[] = db.prepare(
    "select t.ticketID, t.ticketNumber, t.issueDate, t.licencePlateNumber," +
    " o.ownerName1 as licencePlateOwner_ownerName1" +
    " from ParkingTickets t" +

    // Matching Ownership Record
    (" inner join ParkingTicketStatusLog ol on t.ticketID = ol.ticketID" +
      "	and ol.recordDelete_timeMillis is null" +
      " and ol.statusKey = 'ownerLookupMatch'") +
    (" left join LicencePlateOwners o" +
      " on t.licencePlateCountry = o.licencePlateCountry" +
      " and t.licencePlateProvince = o.licencePlateProvince" +
      " and t.licencePlateNumber = o.licencePlateNumber" +
      " and ol.statusField = o.recordDate" +
      " and o.recordDelete_timeMillis is null") +

    " where t.recordDelete_timeMillis is null" +

    // Province of Ontario
    " and t.licencePlateCountry = 'CA'" +
    " and t.licencePlateProvince = 'ON'" +
    " and t.licencePlateNumber != ''" +

    " and t.issueDate <= ?" +

    // No Trial Requested
    // Not Part of Another Conviction Batch
    (" and not exists (" +
      "select 1 from ParkingTicketStatusLog s" +
      " where t.ticketID = s.ticketID" +
      " and s.recordDelete_timeMillis is null" +
      " and s.statusKey in ('trial', 'convictionBatch')" +
      ")") +

    // Unresolved or Resolved with Convicted Status
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
