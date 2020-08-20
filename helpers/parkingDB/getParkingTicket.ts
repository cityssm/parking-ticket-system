import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../ptsTypes";

import { dbPath, canUpdateObject, getParkingLocationWithDB, getLicencePlateOwnerWithDB } from "../parkingDB";


export const getParkingTicket = (ticketID: number, reqSession: Express.Session) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const ticket: pts.ParkingTicket = db.prepare("select t.*," +
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
  ticket.canUpdate = canUpdateObject(ticket, reqSession);

  // Owner

  if (ticket.ownerLookup_statusKey === "ownerLookupMatch") {
    ticket.licencePlateOwner = getLicencePlateOwnerWithDB(db,
      ticket.licencePlateCountry, ticket.licencePlateProvince, ticket.licencePlateNumber,
      parseInt(ticket.ownerLookup_statusField, 10));
  }

  // Location

  ticket.location = getParkingLocationWithDB(db, ticket.locationKey);

  // Status Log

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
    } else {
      statusObj.canUpdate = canUpdateObject(statusObj, reqSession);
    }
  }

  // Remarks

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
    } else {
      remarkObj.canUpdate = canUpdateObject(remarkObj, reqSession);
    }
  }

  db.close();

  return ticket;
};
