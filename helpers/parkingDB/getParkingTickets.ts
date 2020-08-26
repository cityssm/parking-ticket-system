import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../../types/recordTypes";

import { canUpdateObject, getSplitWhereClauseFilter } from "../parkingDB";

import { parkingDB as dbPath } from "../../data/databasePaths";


export interface GetParkingTicketsQueryOptions {
  isResolved?: boolean;
  ticketNumber?: string;
  licencePlateNumber?: string;
  licencePlateNumberEqual?: string;
  licencePlateProvince?: string;
  licencePlateCountry?: string;
  location?: string;
  limit?: number;
  offset?: number;
}


const addCalculatedFields = (ticket: pts.ParkingTicket, reqSession: Express.Session) => {

  ticket.recordType = "ticket";

  ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
  ticket.resolvedDateString = dateTimeFns.dateIntegerToString(ticket.resolvedDate);

  ticket.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(ticket.latestStatus_statusDate);

  ticket.canUpdate = canUpdateObject(ticket, reqSession);
};


const buildWhereClause = (queryOptions: GetParkingTicketsQueryOptions) => {

  const sqlParams = [];

  let sqlWhereClause = " where t.recordDelete_timeMillis is null";

  if (queryOptions.hasOwnProperty("isResolved")) {

    if (queryOptions.isResolved) {
      sqlWhereClause += " and t.resolvedDate is not null";
    } else {
      sqlWhereClause += " and t.resolvedDate is null";
    }
  }

  if (queryOptions.ticketNumber && queryOptions.ticketNumber !== "") {

    const filter = getSplitWhereClauseFilter("t.ticketNumber", queryOptions.ticketNumber);
    sqlWhereClause += filter.sqlWhereClause;
    sqlParams.push.apply(sqlParams, filter.sqlParams);
  }

  if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {

    const filter = getSplitWhereClauseFilter("t.licencePlateNumber", queryOptions.licencePlateNumber);
    sqlWhereClause += filter.sqlWhereClause;
    sqlParams.push.apply(sqlParams, filter.sqlParams);
  }

  if (queryOptions.licencePlateNumberEqual && queryOptions.licencePlateNumberEqual !== "") {
    sqlWhereClause += " and t.licencePlateNumber = ?";
    sqlParams.push(queryOptions.licencePlateNumberEqual);
  }

  if (queryOptions.licencePlateProvince && queryOptions.licencePlateProvince !== "") {
    sqlWhereClause += " and t.licencePlateProvince = ?";
    sqlParams.push(queryOptions.licencePlateProvince);
  }

  if (queryOptions.licencePlateCountry && queryOptions.licencePlateCountry !== "") {
    sqlWhereClause += " and t.licencePlateCountry = ?";
    sqlParams.push(queryOptions.licencePlateCountry);
  }

  if (queryOptions.location && queryOptions.location !== "") {

    const locationPieces = queryOptions.location.toLowerCase().split(" ");

    for (const locationPiece of locationPieces) {
      sqlWhereClause += " and (instr(lower(t.locationDescription), ?) or instr(lower(l.locationName), ?))";
      sqlParams.push(locationPiece);
      sqlParams.push(locationPiece);
    }
  }

  return {
    sqlWhereClause,
    sqlParams
  };
};


export const getParkingTickets = (reqSession: Express.Session, queryOptions: GetParkingTicketsQueryOptions) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  // build where clause

  const sqlWhereClause = buildWhereClause(queryOptions);

  // get the count

  const count = db.prepare("select ifnull(count(*), 0) as cnt" +
    " from ParkingTickets t" +
    " left join ParkingLocations l on t.locationKey = l.locationKey" +
    sqlWhereClause.sqlWhereClause)
    .get(sqlWhereClause.sqlParams)
    .cnt;

  // do query

  const rows: pts.ParkingTicket[] = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate," +
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

    sqlWhereClause.sqlWhereClause +
    " order by t.issueDate desc, t.ticketNumber desc" +
    " limit " + queryOptions.limit.toString() +
    " offset " + queryOptions.offset.toString())
    .all(sqlWhereClause.sqlParams);

  db.close();

  rows.forEach((ticket) => {
    addCalculatedFields(ticket, reqSession);
  });

  return {
    count,
    limit: queryOptions.limit,
    offset: queryOptions.offset,
    tickets: rows
  };
};


export const getParkingTicketsByLicencePlate =
  (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string,
    reqSession: Express.Session) => {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const sqlWhereClause = buildWhereClause({
      licencePlateCountry,
      licencePlateProvince,
      licencePlateNumberEqual: licencePlateNumber
    });

    const rows: pts.ParkingTicket[] = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate," +
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
      sqlWhereClause.sqlWhereClause +
      " order by t.issueDate desc, t.ticketNumber desc")
      .all(sqlWhereClause.sqlParams);

    db.close();

    rows.forEach((ticket) => {
      addCalculatedFields(ticket, reqSession);
    });

    return rows;
  };
