"use strict";

import sqlite = require("better-sqlite3");
const dbPath = "data/parking.db";

import * as dateTimeFns from "./dateTimeFns";
import * as stringFns from "./stringFns";
import * as configFns from "./configFns";
import * as pts from "./ptsTypes";


function canUpdateObject(obj: pts.Record, reqSession: Express.SessionData) {

  const userProperties: pts.UserProperties = reqSession.user.userProperties;

  // check user permissions

  let canUpdate = false;

  if (!reqSession) {

    canUpdate = false;

  } else if (obj.recordDelete_timeMillis) {

    // Deleted records cannot be updated
    canUpdate = false;

  } else if (userProperties.canUpdate) {

    canUpdate = true;

  } else if (userProperties.canCreate &&
    (obj.recordCreate_userName === reqSession.user.userName ||
      obj.recordUpdate_userName === reqSession.user.userName) &&
    obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {

    // Users with only create permission can update their own records within the time window
    canUpdate = true;

  }

  // If recently updated, send back permission

  if (obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {

    return canUpdate;

  }

  if (canUpdate) {

    switch (obj.recordType) {

      case "ticket":

        if ((<pts.ParkingTicket>obj).resolvedDate) {
          canUpdate = false;
        }
        break;
    }

  }

  return canUpdate;
}


function getParkingLocationWithDB(db: sqlite.Database, locationKey: string) {

  const location: pts.ParkingLocation = db.prepare("select locationKey, locationName, locationClassKey, isActive" +
    " from ParkingLocations" +
    " where locationKey = ?")
    .get(locationKey);

  return location;

}


function getLicencePlateOwnerWithDB(db: sqlite.Database, licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string) {

  const licencePlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[licencePlateCountry] || licencePlateCountry;

  const licencePlateProvinceAlias =
    (configFns.getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias] || {})
    [licencePlateProvince] || licencePlateProvince;

  const possibleOwners: pts.LicencePlateOwner[] = db.prepare("select * from LicencePlateOwners" +
    " where recordDelete_timeMillis is null" +
    " and licencePlateNumber = ?")
    .all(licencePlateNumber);

  for (let index = 0; index < possibleOwners.length; index += 1) {

    const possibleOwnerObj = possibleOwners[index];

    const ownerPlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[possibleOwnerObj.licencePlateCountry] || possibleOwnerObj.licencePlateCountry;

    const ownerPlateProvinceAlias =
      (configFns.getProperty("licencePlateProvinceAliases")[ownerPlateCountryAlias] || {})
      [possibleOwnerObj.licencePlateProvince] || possibleOwnerObj.licencePlateProvince;

    if (licencePlateCountryAlias === ownerPlateCountryAlias && licencePlateProvinceAlias === ownerPlateProvinceAlias) {
      possibleOwnerObj.recordDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.recordDate);
      possibleOwnerObj.driverLicenceExpiryDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.driverLicenceExpiryDate);
      return possibleOwnerObj;
    }
  }

  return null;
}


export type getParkingTickets_queryOptions = {
  isResolved?: boolean,
  ticketNumber?: string,
  licencePlateNumber?: string,
  location?: string,
  limit: number,
  offset: number
};

export function getParkingTickets(reqSession: Express.SessionData, queryOptions: getParkingTickets_queryOptions) {

  const addCalculatedFieldsFn = function(ele: pts.ParkingTicket) {

    ele.recordType = "ticket";

    ele.issueDateString = dateTimeFns.dateIntegerToString(ele.issueDate);
    ele.resolvedDateString = dateTimeFns.dateIntegerToString(ele.resolvedDate);

    ele.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(ele.latestStatus_statusDate);

    ele.canUpdate = canUpdateObject(ele, reqSession);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  // build where clause

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

    const ticketNumberPieces = queryOptions.ticketNumber.toLowerCase().split(" ");

    for (let index = 0; index < ticketNumberPieces.length; index += 1) {

      sqlWhereClause += " and instr(lower(t.ticketNumber), ?)";
      sqlParams.push(ticketNumberPieces[index]);

    }

  }

  if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {

    const licencePlateNumberPieces = queryOptions.licencePlateNumber.toLowerCase().split(" ");

    for (let index = 0; index < licencePlateNumberPieces.length; index += 1) {

      sqlWhereClause += " and instr(lower(t.licencePlateNumber), ?)";
      sqlParams.push(licencePlateNumberPieces[index]);

    }

  }

  if (queryOptions.location && queryOptions.location !== "") {

    const locationPieces = queryOptions.location.toLowerCase().split(" ");

    for (let index = 0; index < locationPieces.length; index += 1) {

      sqlWhereClause += " and (instr(lower(t.locationDescription), ?) or instr(lower(l.locationName), ?))";
      sqlParams.push(locationPieces[index]);
      sqlParams.push(locationPieces[index]);

    }

  }

  // get the count

  const count = db.prepare("select ifnull(count(*), 0) as cnt" +
    " from ParkingTickets t" +
    " left join ParkingLocations l on t.locationKey = l.locationKey" +
    sqlWhereClause)
    .get(sqlParams)
    .cnt;

  // do query

  const rows: pts.ParkingTicket[] = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate," +
    " t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +
    " l.locationName, l.locationClassKey, t.locationDescription," +
    " t.parkingOffence, t.offenceAmount, t.resolvedDate," +
    " s.statusDate as latestStatus_statusDate," +
    " s.statusKey as latestStatus_statusKey," +
    " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +

    " from ParkingTickets t" +
    " left join ParkingLocations l on t.locationKey = l.locationKey" +
    (" left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
      " and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID order by s.statusDate desc, s.statusIndex limit 1)") +

    sqlWhereClause +
    " order by t.issueDate desc, t.issueTime desc, t.ticketNumber desc" +
    " limit " + queryOptions.limit +
    " offset " + queryOptions.offset)
    .all(sqlParams);

  db.close();

  rows.forEach(addCalculatedFieldsFn);

  return {
    count: count,
    tickets: rows
  };
}

export function getParkingTicket(ticketID: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const ticket: pts.ParkingTicket = db.prepare("select * from ParkingTickets" +
    " where ticketID = ?")
    .get(ticketID);

  ticket.recordType = "ticket";
  ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
  ticket.issueTimeString = dateTimeFns.timeIntegerToString(ticket.issueTime);
  ticket.resolvedDateString = dateTimeFns.dateIntegerToString(ticket.resolvedDate);
  ticket.canUpdate = canUpdateObject(ticket, reqSession);

  // Owner

  ticket.licencePlateOwner = getLicencePlateOwnerWithDB(db, ticket.licencePlateCountry, ticket.licencePlateProvince, ticket.licencePlateNumber);

  // Location

  ticket.location = getParkingLocationWithDB(db, ticket.locationKey);

  // Status Log

  ticket.statusLog = db.prepare("select * from ParkingTicketStatusLog" +
    " where recordDelete_timeMillis is null" +
    " and ticketID = ?" +
    " order by statusDate desc, statusTime desc, statusIndex desc")
    .all(ticketID);

  for (let index = 0; index < ticket.statusLog.length; index += 1) {

    const statusObj = ticket.statusLog[index];

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

  for (let index = 0; index < ticket.remarks.length; index += 1) {

    const remarkObj = ticket.remarks[index];

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

}
