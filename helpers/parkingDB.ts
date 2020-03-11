"use strict";

import sqlite = require("better-sqlite3");
const dbPath = "data/parking.db";

import * as vehicleFns from "./vehicleFns";
import * as dateTimeFns from "./dateTimeFns";
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
      possibleOwnerObj.vehicleMake = vehicleFns.getMakeFromNCIC(possibleOwnerObj.vehicleNCIC);

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
    " t.locationKey, l.locationName, l.locationClassKey, t.locationDescription," +
    " t.parkingOffence, t.offenceAmount, t.resolvedDate," +
    " s.statusDate as latestStatus_statusDate," +
    " s.statusKey as latestStatus_statusKey," +
    " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +

    " from ParkingTickets t" +
    " left join ParkingLocations l on t.locationKey = l.locationKey" +
    (" left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
      " and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID order by s.statusDate desc, s.statusIndex limit 1)") +

    sqlWhereClause +
    " order by t.issueDate desc, t.ticketNumber desc" +
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

export function getParkingTicketsByLicencePlate(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, reqSession: Express.Session) {

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

  const tickets: pts.ParkingTicket[] = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate," +
    " t.vehicleMakeModel," +
    " t.locationKey, l.locationName, l.locationClassKey, t.locationDescription," +
    " t.parkingOffence, t.offenceAmount, t.resolvedDate," +
    " s.statusDate as latestStatus_statusDate," +
    " s.statusKey as latestStatus_statusKey," +
    " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +
    " from ParkingTickets t" +
    " left join ParkingLocations l on t.locationKey = l.locationKey" +
    (" left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
      " and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID order by s.statusDate desc, s.statusIndex limit 1)") +
    " where t.recordDelete_timeMillis is null" +
    " and t.licencePlateCountry = ?" +
    " and t.licencePlateProvince = ?" +
    " and t.licencePlateNumber = ?" +
    " order by t.issueDate desc, t.ticketNumber desc")
    .all(licencePlateCountry, licencePlateProvince, licencePlateNumber);

    db.close();

    tickets.forEach(addCalculatedFieldsFn);

    return tickets;
}

export function getParkingTicket(ticketID: number, reqSession: Express.SessionData) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const ticket: pts.ParkingTicket = db.prepare("select * from ParkingTickets" +
    " where ticketID = ?")
    .get(ticketID);

  if (!ticket) {
    db.close();
    return ticket;
  }

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

export function createParkingTicket(reqBody: pts.ParkingTicket, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const issueDate = dateTimeFns.dateStringToInteger(reqBody.issueDateString);

  if (configFns.getProperty("parkingTickets.ticketNumber.isUnique")) {

    // Ensure ticket number has not been used in the last two years

    const duplicateTicket = db.prepare("select ticketID from ParkingTickets" +
      " where recordDelete_timeMillis is null" +
      " and ticketNumber = ?" +
      " and abs(issueDate - ?) <= 20000")
      .get(reqBody.ticketNumber, issueDate);

    if (duplicateTicket) {

      db.close();

      return {
        success: false,
        message: "A ticket with the same ticket number was seen in the last two years."
      };

    }

  }

  const info = db.prepare("insert into ParkingTickets" +
    " (ticketNumber, issueDate, issueTime, issuingOfficer," +
    " locationKey, locationDescription," +
    " bylawNumber, parkingOffence, offenceAmount," +
    " licencePlateCountry, licencePlateProvince, licencePlateNumber, vehicleMakeModel," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reqBody.ticketNumber,
      issueDate,
      dateTimeFns.timeStringToInteger(reqBody.issueTimeString),
      reqBody.issuingOfficer,
      reqBody.locationKey,
      reqBody.locationDescription,
      reqBody.bylawNumber,
      reqBody.parkingOffence,
      reqBody.offenceAmount,
      reqBody.licencePlateCountry,
      reqBody.licencePlateProvince,
      reqBody.licencePlateNumber,
      reqBody.vehicleMakeModel,
      reqSession.user.userName,
      nowMillis,
      reqSession.user.userName,
      nowMillis
    );

  db.close();

  return {
    success: true,
    ticketID: info.lastInsertRowid,
    nextTicketNumber: ""
  };
}

export function updateParkingTicket(reqBody: pts.ParkingTicket, reqSession: Express.SessionData) {

  const db = sqlite(dbPath);

  const nowMillis = Date.now();

  const issueDate = dateTimeFns.dateStringToInteger(reqBody.issueDateString);

  if (configFns.getProperty("parkingTickets.ticketNumber.isUnique")) {

    // Ensure ticket number has not been used in the last two years

    const duplicateTicket = db.prepare("select ticketID from ParkingTickets" +
      " where recordDelete_timeMillis is null" +
      " and ticketNumber = ?" +
      " and ticketID != ?" +
      " and abs(issueDate - ?) <= 20000")
      .get(reqBody.ticketNumber,
        reqBody.ticketID,
        issueDate);

    if (duplicateTicket) {

      db.close();

      return {
        success: false,
        message: "A ticket with the same ticket number was seen in the last two years."
      };

    }

  }

  const info = db.prepare("update ParkingTickets" +
    " set ticketNumber = ?," +
    " issueDate = ?," +
    " issueTime = ?," +
    " issuingOfficer = ?," +
    " locationKey = ?," +
    " locationDescription = ?," +
    " bylawNumber = ?," +
    " parkingOffence = ?," +
    " offenceAmount = ?," +
    " licencePlateCountry = ?," +
    " licencePlateProvince = ?," +
    " licencePlateNumber = ?," +
    " vehicleMakeModel = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and recordDelete_timeMillis is null")
    .run(reqBody.ticketNumber,
      issueDate,
      dateTimeFns.timeStringToInteger(reqBody.issueTimeString),
      reqBody.issuingOfficer,
      reqBody.locationKey,
      reqBody.locationDescription,
      reqBody.bylawNumber,
      reqBody.parkingOffence,
      reqBody.offenceAmount,
      reqBody.licencePlateCountry,
      reqBody.licencePlateProvince,
      reqBody.licencePlateNumber,
      reqBody.vehicleMakeModel,
      reqSession.user.userName,
      nowMillis,
      reqBody.ticketID
    );

  db.close();

  if (info.changes) {

    return {
      success: true
    };

  } else {

    return {
      success: false,
      message: "An error occurred saving this ticket.  Please try again."
    };

  }

}

export function getRecentParkingTicketVehicleMakeModelValues() {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const issueDate = dateTimeFns.dateToInteger(sixMonthsAgo);

  const rows = db.prepare("select vehicleMakeModel" +
    " from ParkingTickets" +
    " where recordDelete_timeMillis is null" +
    " and issueDate > ?" +
    " group by vehicleMakeModel" +
    " having count(vehicleMakeModel) > 3" +
    " order by vehicleMakeModel")
    .all(issueDate);

  db.close();

  const vehicleMakeModelList = [];

  for (let index = 0; index < rows.length; index += 1) {

    vehicleMakeModelList.push(rows[index].vehicleMakeModel);
  }

  return vehicleMakeModelList;

}


export type getLicencePlates_queryOptions = {
  licencePlateNumber?: string,
  hasOwnerRecord?: boolean,
  hasUnresolvedTickets?: boolean,
  limit: number,
  offset: number
};

export function getLicencePlates(queryOptions: getLicencePlates_queryOptions) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  // build where clause

  let sqlParams = [];

  let sqlInnerWhereClause = " where recordDelete_timeMillis is null";

  if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {

    const licencePlateNumberPieces = queryOptions.licencePlateNumber.toLowerCase().split(" ");

    for (let index = 0; index < licencePlateNumberPieces.length; index += 1) {

      sqlInnerWhereClause += " and instr(lower(licencePlateNumber), ?)";
      sqlParams.push(licencePlateNumberPieces[index]);

    }

  }

  sqlParams = sqlParams.concat(sqlParams);

  // build having clause

  let sqlHavingClause = " having 1 = 1";

  if (queryOptions.hasOwnProperty("hasOwnerRecord")) {

    if (queryOptions.hasOwnerRecord) {
      sqlHavingClause += " and hasOwnerRecord = 1";
    } else {
      sqlHavingClause += " and hasOwnerRecord = 0";
    }

  }

  if (queryOptions.hasOwnProperty("hasUnresolvedTickets")) {

    if (queryOptions.hasUnresolvedTickets) {
      sqlHavingClause += " and unresolvedTicketCount > 0";
    } else {
      sqlHavingClause += " and unresolvedTicketCount = 0";
    }

  }

  // get the count

  const innerSql = "select licencePlateCountry, licencePlateProvince, licencePlateNumber," +
    " sum(unresolvedTicketCountInternal) as unresolvedTicketCount," +
    " cast(sum(hasOwnerRecordInternal) as bit) as hasOwnerRecord from (" +

    "select licencePlateCountry, licencePlateProvince, licencePlateNumber," +
    " 0 as unresolvedTicketCountInternal, 1 as hasOwnerRecordInternal" +
    " from LicencePlateOwners" +
    sqlInnerWhereClause +

    " union" +

    " select licencePlateCountry, licencePlateProvince, licencePlateNumber," +
    " sum(case when resolvedDate is null then 1 else 0 end) as unresolvedTicketCountInternal, 0 as hasOwnerRecordInternal" +
    " from ParkingTickets" +
    sqlInnerWhereClause +
    " group by licencePlateCountry, licencePlateProvince, licencePlateNumber" +

    ")" +
    " group by licencePlateCountry, licencePlateProvince, licencePlateNumber" +
    sqlHavingClause;

  const count = db.prepare("select ifnull(count(*), 0) as cnt" +
    " from (" + innerSql + ")")
    .get(sqlParams)
    .cnt;

  // do query

  const rows = db.prepare(innerSql +
    " order by licencePlateNumber, licencePlateProvince, licencePlateCountry" +
    " limit " + queryOptions.limit +
    " offset " + queryOptions.offset)
    .all(sqlParams);

  db.close();

  return {
    count: count,
    licencePlates: rows
  };

}

export function getLicencePlateOwner(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const ownerRecord = getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber);

  db.close();

  return ownerRecord;

}

export function getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate: number) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows = db.prepare("select vehicleNCIC, max(recordDate) as recordDateMax" +
    " from LicencePlateOwners" +
    " where recordDate >= ?" +
    " group by vehicleNCIC" +
    " order by recordDateMax desc")
    .all(cutoffDate);

  db.close();

  return rows;

}

export function getParkingLocations() {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingLocation[] = db.prepare("select locationKey, locationName, locationClassKey" +
    " from ParkingLocations" +
    " where isActive = 1" +
    " order by orderNumber, locationName")
    .all();

  db.close();

  return rows;
}

export function getParkingOffences(locationKey: string) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingOffence[] = db.prepare("select o.bylawNumber, b.bylawDescription," +
    " o.parkingOffence, o.offenceAmount" +
    " from ParkingOffences o" +
    " left join ParkingBylaws b on o.bylawNumber = b.bylawNumber" +
    " where o.isActive = 1 and b.isActive = 1" +
    " and o.locationKey = ?" +
    " order by b.orderNumber, b.bylawNumber")
    .all(locationKey);

  db.close();

  return rows;
}

export function getParkingTicketsForLookupBatch(includeBatchID: number) {

  /*

  select t.ticketID, t.ticketNumber, t.issueDate, t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber, b.batchID
  from ParkingTickets t
  left join LicencePlateLookupBatchEntries e on t.ticketID = e.ticketID
  left join LicencePlateLookupBatches b on e.batchID = b.batchID
  where t.recordDelete_timeMillis is NULL
  and t.licencePlateCountry = 'CA'
  and t.licencePlateProvince = 'ON'
  and t.licencePlateNumber != ''
  and t.resolvedDate is null
  and (b.batchID is null or b.recordDelete_timeMillis is not null)
  and not exists (select 1 from ParkingTicketStatusLog s where t.ticketID = s.ticketID and s.recordDelete_timeMillis is null and s.statusKey in ('ownerLookupPending', 'ownerLookupMatch', 'ownerLookupError'))
  and t.issueDate >= 20200101


   */
}
