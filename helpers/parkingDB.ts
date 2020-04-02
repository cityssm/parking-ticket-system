"use strict";

import sqlite = require("better-sqlite3");
export const dbPath = "data/parking.db";

import * as vehicleFns from "./vehicleFns";
import * as dateTimeFns from "./dateTimeFns";
import * as configFns from "./configFns";
import * as pts from "./ptsTypes";


function canUpdateObject(obj: pts.Record, reqSession: Express.Session) {

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


export function getRawRowsColumns(sql: string, params: any[]): pts.RawRowsColumnsReturn {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const stmt = db.prepare(sql);

  stmt.raw(true);

  const rows = stmt.all(params);
  const columns = stmt.columns();

  stmt.raw(false);

  db.close();

  return {
    rows: rows,
    columns: columns
  };

}



function getParkingLocationWithDB(db: sqlite.Database, locationKey: string) {

  const location: pts.ParkingLocation = db.prepare("select locationKey, locationName, locationClassKey, isActive" +
    " from ParkingLocations" +
    " where locationKey = ?")
    .get(locationKey);

  return location;

}


function getLicencePlateOwnerWithDB(db: sqlite.Database, licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number) {

  const licencePlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[licencePlateCountry] || licencePlateCountry;

  const licencePlateProvinceAlias =
    (configFns.getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias] || {})
    [licencePlateProvince] || licencePlateProvince;

  const possibleOwners: pts.LicencePlateOwner[] = db.prepare("select * from LicencePlateOwners" +
    " where recordDelete_timeMillis is null" +
    " and licencePlateNumber = ?" +
    " and recordDate >= ?" +
    " order by recordDate")
    .all(licencePlateNumber, recordDateOrBefore);

  for (let index = 0; index < possibleOwners.length; index += 1) {

    const possibleOwnerObj = possibleOwners[index];

    const ownerPlateCountryAlias = configFns.getProperty("licencePlateCountryAliases")[possibleOwnerObj.licencePlateCountry] || possibleOwnerObj.licencePlateCountry;

    const ownerPlateProvinceAlias =
      (configFns.getProperty("licencePlateProvinceAliases")[ownerPlateCountryAlias] || {})
      [possibleOwnerObj.licencePlateProvince] || possibleOwnerObj.licencePlateProvince;

    if (licencePlateCountryAlias === ownerPlateCountryAlias && licencePlateProvinceAlias === ownerPlateProvinceAlias) {

      possibleOwnerObj.recordDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.recordDate);
      possibleOwnerObj.licencePlateExpiryDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.licencePlateExpiryDate);
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

export function getParkingTickets(reqSession: Express.Session, queryOptions: getParkingTickets_queryOptions) {

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
      " and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)") +

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
      " and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)") +
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

export function getParkingTicket(ticketID: number, reqSession: Express.Session) {

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

  ticket.licencePlateOwner = getLicencePlateOwnerWithDB(db, ticket.licencePlateCountry, ticket.licencePlateProvince, ticket.licencePlateNumber, ticket.issueDate);

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

export function getParkingTicketID(ticketNumber: string) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const ticketRow = db.prepare("select ticketID" +
    " from ParkingTickets" +
    " where ticketNumber = ?" +
    " and recordDelete_timeMillis is null" +
    " order by ticketID desc" +
    " limit 1")
    .get(ticketNumber);

  db.close();

  if (ticketRow) {
    return ticketRow.ticketID;
  }

  return null;
}

export function createParkingTicket(reqBody: pts.ParkingTicket, reqSession: Express.Session) {

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

export function updateParkingTicket(reqBody: pts.ParkingTicket, reqSession: Express.Session) {

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
    " and resolvedDate is null" +
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

export function deleteParkingTicket(ticketID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTickets" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where ticketID = ?" +
    " and recordDelete_timeMillis is null")
    .run(reqSession.user.userName,
      Date.now(),
      ticketID);

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function resolveParkingTicket(ticketID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("update ParkingTickets" +
    " set resolvedDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and resolvedDate is null" +
    " and recordDelete_timeMillis is null")
    .run(dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      ticketID);

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function unresolveParkingTicket(ticketID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Check if the ticket is in the window

  const ticketObj = db.prepare("select recordUpdate_timeMillis from ParkingTickets" +
    " where ticketID = ?" +
    " and recordDelete_timeMillis is null" +
    " and resolvedDate is not null")
    .get(ticketID);

  if (!ticketObj) {

    db.close();

    return {
      success: false,
      message: "The ticket has either been deleted, or is no longer marked as resolved."
    };

  } else if (ticketObj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") < Date.now()) {

    db.close();

    return {
      success: false,
      message: "The ticket is outside of the window for removing the resolved status."
    };

  }

  const info = db.prepare("update ParkingTickets" +
    " set resolvedDate = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and resolvedDate is not null" +
    " and recordDelete_timeMillis is null")
    .run(reqSession.user.userName,
      Date.now(),
      ticketID);

  db.close();

  return {
    success: (info.changes > 0)
  };

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


/*
 * Parking Ticket Remarks
 */


export function getParkingTicketRemarks(ticketID: number, reqSession: Express.Session) {

  const addCalculatedFieldsFn = function(remark: pts.ParkingTicketRemark) {

    remark.recordType = "remark";

    remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate);
    remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime);

    remark.canUpdate = canUpdateObject(remark, reqSession);

  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const remarkRows: pts.ParkingTicketRemark[] = db.prepare("select remarkIndex, remarkDate, remarkTime, remark," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
    " from ParkingTicketRemarks" +
    " where recordDelete_timeMillis is null" +
    " and ticketID = ?" +
    " order by remarkDate desc, remarkTime desc, remarkIndex desc")
    .all(ticketID);

  db.close();

  remarkRows.forEach(addCalculatedFieldsFn);

  return remarkRows;

}

export function createParkingTicketRemark(reqBody: pts.ParkingTicketRemark, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Get new remark index

  const remarkIndexNew = db.prepare("select ifnull(max(remarkIndex), 0) as remarkIndexMax" +
    " from ParkingTicketRemarks" +
    " where ticketID = ?")
    .get(reqBody.ticketID)
    .remarkIndexMax + 1;

  // Create the record

  const rightNow = new Date();

  const info = db.prepare("insert into ParkingTicketRemarks" +
    " (ticketID, remarkIndex, remarkDate, remarkTime, remark," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reqBody.ticketID,
      remarkIndexNew,
      dateTimeFns.dateToInteger(rightNow),
      dateTimeFns.dateToTimeInteger(rightNow),
      reqBody.remark,
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime());

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function updateParkingTicketRemark(reqBody: pts.ParkingTicketRemark, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTicketRemarks" +
    " set remarkDate = ?," +
    " remarkTime = ?," +
    " remark = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and remarkIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      dateTimeFns.dateStringToInteger(reqBody.remarkDateString),
      dateTimeFns.timeStringToInteger(reqBody.remarkTimeString),
      reqBody.remark,
      reqSession.user.userName,
      Date.now(),
      reqBody.ticketID,
      reqBody.remarkIndex);

  db.close();

  return {
    success: (info.changes > 0)
  };
}

export function deleteParkingTicketRemark(ticketID: number, remarkIndex: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTicketRemarks" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where ticketID = ?" +
    " and remarkIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(reqSession.user.userName,
      Date.now(),
      ticketID,
      remarkIndex);

  db.close();

  return {
    success: (info.changes > 0)
  };
}


/*
 * Parking Ticket Statuses
 */

export function getParkingTicketStatuses(ticketID: number, reqSession: Express.Session) {

  const addCalculatedFieldsFn = function(status: pts.ParkingTicketStatusLog) {

    status.recordType = "status";

    status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
    status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);

    status.canUpdate = canUpdateObject(status, reqSession);

  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const statusRows = db.prepare("select statusIndex, statusDate, statusTime," +
    " statusKey, statusField, statusNote," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
    " from ParkingTicketStatusLog" +
    " where recordDelete_timeMillis is null" +
    " and ticketID = ?" +
    " order by statusDate desc, statusTime desc, statusIndex desc")
    .all(ticketID);

  db.close();

  statusRows.forEach(addCalculatedFieldsFn);

  return statusRows;

}


export function createParkingTicketStatus(reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: Express.Session, resolveTicket: boolean) {

  const db = sqlite(dbPath);

  // Get new status index

  const statusIndexNew = db.prepare("select ifnull(max(statusIndex), 0) as statusIndexMax" +
    " from ParkingTicketStatusLog" +
    " where ticketID = ?")
    .get(reqBodyOrObj.ticketID)
    .statusIndexMax + 1;

  // Create the record

  const rightNow = new Date();

  const info = db.prepare("insert into ParkingTicketStatusLog" +
    " (ticketID, statusIndex, statusDate, statusTime, statusKey," +
    " statusField, statusNote," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reqBodyOrObj.ticketID,
      statusIndexNew,
      dateTimeFns.dateToInteger(rightNow),
      dateTimeFns.dateToTimeInteger(rightNow),
      reqBodyOrObj.statusKey,
      reqBodyOrObj.statusField,
      reqBodyOrObj.statusNote,
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime());

  if (info.changes > 0 && resolveTicket) {

    db.prepare("update ParkingTickets" +
      " set resolvedDate = ?," +
      " recordUpdate_userName = ?," +
      " recordUpdate_timeMillis = ?" +
      " where ticketID = ?" +
      " and resolvedDate is null" +
      " and recordDelete_timeMillis is null")
      .run(dateTimeFns.dateToInteger(rightNow),
        reqSession.user.userName,
        rightNow.getTime(),
        reqBodyOrObj.ticketID);

  }

  db.close();

  return {
    success: (info.changes > 0),
    statusIndex: statusIndexNew
  };

}


export function updateParkingTicketStatus(reqBody: pts.ParkingTicketStatusLog, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTicketStatusLog" +
    " set statusDate = ?," +
    " statusTime = ?," +
    " statusKey = ?," +
    " statusField = ?," +
    " statusNote = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and statusIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(
      dateTimeFns.dateStringToInteger(reqBody.statusDateString),
      dateTimeFns.timeStringToInteger(reqBody.statusTimeString),
      reqBody.statusKey,
      reqBody.statusField,
      reqBody.statusNote,
      reqSession.user.userName,
      Date.now(),
      reqBody.ticketID,
      reqBody.statusIndex);

  db.close();

  return {
    success: (info.changes > 0)
  };
}


export function deleteParkingTicketStatus(ticketID: number, statusIndex: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTicketStatusLog" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where ticketID = ?" +
    " and statusIndex = ?" +
    " and recordDelete_timeMillis is null")
    .run(reqSession.user.userName,
      Date.now(),
      ticketID,
      statusIndex);

  db.close();

  return {
    success: (info.changes > 0)
  };
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

export function getLicencePlateOwner(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const ownerRecord = getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);

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


/*
 * Licence Plate Export
 */


export function getLicencePlateLookupBatch(batchID_or_negOne: number) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const baseBatchSQL = "select batchID, batchDate, lockDate, sentDate, receivedDate," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
    " from LicencePlateLookupBatches" +
    " where recordDelete_timeMillis is null";

  let batch: pts.LicencePlateLookupBatch;

  if (batchID_or_negOne == -1) {

    batch = db.prepare(baseBatchSQL +
      " and lockDate is null" +
      " order by batchID desc" +
      " limit 1")
      .get();

  } else {

    batch = db.prepare(baseBatchSQL +
      " and batchID = ?")
      .get(batchID_or_negOne);
  }

  if (!batch) {
    return null;
  }

  batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
  batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
  batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
  batch.receivedDateString = dateTimeFns.dateIntegerToString(batch.receivedDate);

  batch.batchEntries = db.prepare("select e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber," +
    " e.ticketID, t.ticketNumber, t.issueDate" +
    " from LicencePlateLookupBatchEntries e" +
    " left join ParkingTickets t on e.ticketID = t.ticketID" +
    " where e.batchID = ?" +
    " order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber")
    .all(batch.batchID);

  db.close();

  return batch;
}


type addLicencePlateToLookupBatch_return = {
  success: boolean,
  message?: string,
  batch?: pts.LicencePlateLookupBatch
}
export function addLicencePlateToLookupBatch(reqBody, reqSession: Express.Session): addLicencePlateToLookupBatch_return {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(reqSession.user.userName,
      Date.now(),
      reqBody.batchID).changes;

  if (canUpdateBatch === 0) {

    db.close();

    return {
      success: false,
      message: "Batch cannot be updated."
    };

  }

  const info = db.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
    " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
    " values (?, ?, ?, ?, ?)")
    .run(reqBody.batchID,
      reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber,
      reqBody.ticketID);

  db.close();

  if (info.changes > 0) {

    return {
      success: true
    };

  } else {

    return {
      success: false,
      message: "Licence plate not added to the batch.  It may be already part of the batch."
    }
  }

}


type addAllLicencePlatesToLookupBatch_body = {
  batchID: number,
  licencePlateCountry: string,
  licencePlateProvince: string,
  licencePlateNumbers: [string, number][]
};

export function addAllLicencePlatesToLookupBatch(reqBody: addAllLicencePlatesToLookupBatch_body, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(reqSession.user.userName,
      Date.now(),
      reqBody.batchID).changes;

  if (canUpdateBatch === 0) {

    db.close();

    return {
      success: false,
      message: "Batch cannot be updated."
    };

  }

  const insertStmt = db.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
    " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
    " values (?, ?, ?, ?, ?)");

  let changeCount = 0;

  for (let index = 0; index < reqBody.licencePlateNumbers.length; index += 1) {

    const info = insertStmt
      .run(reqBody.batchID,
        reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumbers[index][0],
        reqBody.licencePlateNumbers[index][1]);

    changeCount += info.changes;
  }

  db.close();

  if (changeCount > 0) {

    return {
      success: true,
      batch: getLicencePlateLookupBatch(reqBody.batchID)
    };

  } else {

    return {
      success: false,
      message: "Licence plate not added to the batch.  It may be already part of the batch."
    }
  }

}


export function removeLicencePlateFromLookupBatch(reqBody, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(reqSession.user.userName,
      Date.now(),
      reqBody.batchID).changes;

  if (canUpdateBatch === 0) {

    db.close();

    return {
      success: false,
      message: "Batch cannot be updated."
    };

  }

  const info = db.prepare("delete from LicencePlateLookupBatchEntries" +
    " where batchID = ?" +
    " and licencePlateCountry = ?" +
    " and licencePlateProvince = ?" +
    " and licencePlateNumber = ?")
    .run(reqBody.batchID,
      reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber);

  db.close();

  if (info.changes > 0) {

    return {
      success: true
    };

  } else {

    return {
      success: false,
      message: "Licence plate not removed from the batch."
    }
  }

}

type lookupBatch_return = {
  success: boolean,
  message?: string,
  batch?: pts.LicencePlateLookupBatch
};

export function clearLookupBatch(batchID: number, reqSession: Express.Session): lookupBatch_return {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(reqSession.user.userName,
      Date.now(),
      batchID).changes;

  if (canUpdateBatch === 0) {

    db.close();

    return {
      success: false,
      message: "Batch cannot be updated."
    };

  }

  db.prepare("delete from LicencePlateLookupBatchEntries" +
    " where batchID = ?")
    .run(batchID);

  db.close();

  return {
    success: true
  };
}

export function lockLookupBatch(batchID: number, reqSession: Express.Session): lookupBatch_return {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("update LicencePlateLookupBatches" +
    " set lockDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(
      dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      batchID);

  if (info.changes > 0) {

    db.prepare("insert into ParkingTicketStatusLog" +
      " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +

      " select t.ticketID," +
      " ifnull(max(s.statusIndex), 0) + 1 as statusIndex," +
      " ? as statusDate," +
      " ? as statusTime," +
      " 'ownerLookupPending' as statusKey," +
      " e.batchID as statusField," +
      " 'Looking up '||e.licencePlateNumber||' '||e.licencePlateProvince||' '||e.licencePlateCountry as statusNote," +
      " ? as recordCreate_userName," +
      " ? as recordCreate_timeMillis," +
      " ? as recordUpdate_userName," +
      " ? as recordUpdate_timeMillis" +
      " from LicencePlateLookupBatchEntries e" +
      " left join ParkingTickets t" +
      " on e.licencePlateCountry = t.licencePlateCountry" +
      " and e.licencePlateProvince = t.licencePlateProvince" +
      " and e.licencePlateNumber = t.licencePlateNumber" +
      " left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
      " where e.batchID = ?" +
      " and (e.ticketID = t.ticketID or (t.recordDelete_timeMillis is null and t.resolvedDate is null))" +
      " group by t.ticketID, e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber, e.batchID" +
      " having max(" +
      "case when s.statusKey in ('ownerLookupPending', 'ownerLookupMatch', 'ownerLookupError') and s.recordDelete_timeMillis is null then 1" +
      " else 0" +
      " end) = 0")
      .run(dateTimeFns.dateToInteger(rightNow),
        dateTimeFns.dateToTimeInteger(rightNow),
        reqSession.user.userName,
        rightNow.getTime(),
        reqSession.user.userName,
        rightNow.getTime(),
        batchID);

  }

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function markLookupBatchAsSent(batchID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("update LicencePlateLookupBatches" +
    " set sentDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is not null" +
    " and sentDate is null")
    .run(dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      batchID);

  db.close();

  return (info.changes > 0);
}

export function getUnreceivedLicencePlateLookupBatches() {

  const addCalculatedFieldsFn = function(batch: pts.LicencePlateLookupBatch) {
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const batches: pts.LicencePlateLookupBatch[] = db.prepare(
    "select b.batchID, b.batchDate, b.lockDate, b.sentDate, count(e.batchID) as batchEntryCount" +
    " from LicencePlateLookupBatches b" +
    " left join LicencePlateLookupBatchEntries e on b.batchID = e.batchID" +
    " where b.recordDelete_timeMillis is null" +
    " and b.receivedDate is null" +
    " group by b.batchID, b.batchDate, b.lockDate, b.sentDate" +
    " order by b.batchID desc")
    .all();

  db.close();

  batches.forEach(addCalculatedFieldsFn);

  return batches;
}


export function createLicencePlateLookupBatch(reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("insert into LicencePlateLookupBatches" +
    " (batchDate, recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?)")
    .run(
      dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime()
    );

  if (info.changes > 0) {
    return {
      success: true,
      batch: {
        batchID: info.lastInsertRowid,
        batchDate: dateTimeFns.dateToInteger(rightNow),
        batchDateString: dateTimeFns.dateToString(rightNow),
        lockDate: null,
        lockDateString: "",
        batchEntries: []
      }
    }
  } else {
    return { success: false };
  }
}

type MTO_AvailableLicencePlate = {
  licencePlateNumber: string,
  ticketCount: number,
  issueDateMin: number,
  issueDateMinString: string,
  issueDateMax: number,
  issueDateMaxString: string,
  ticketNumbersConcat: string,
  ticketNumbers: string[]
}

export function mto_getLicencePlatesAvailableForLookupBatch(currentBatchID: number, issueDaysAgo: number) {

  const addCalculatedFieldsFn = function(plateRecord: MTO_AvailableLicencePlate) {
    plateRecord.issueDateMinString = dateTimeFns.dateIntegerToString(plateRecord.issueDateMin);
    plateRecord.issueDateMaxString = dateTimeFns.dateIntegerToString(plateRecord.issueDateMax);
    plateRecord.ticketNumbers = plateRecord.ticketNumbersConcat.split(":");
    delete plateRecord.ticketNumbersConcat;
  };

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
    " left join LicencePlateLookupBatchEntries e on t.licencePlateNumber = e.licencePlateNumber and (t.ticketID = e.ticketID or e.batchID = ?)" +
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

  plates.forEach(addCalculatedFieldsFn);

  return plates;

}

export interface ReconciliationRecord extends pts.LicencePlate {

  ticket_ticketID: number,
  ticket_ticketNumber: string,
  ticket_issueDate: number,
  ticket_issueDateString: string,
  ticket_vehicleMakeModel: string,

  owner_recordDate: number,
  owner_recordDateString: string,

  owner_vehicleNCIC: string,
  owner_vehicleNCICMake: string,
  owner_vehicleYear: number,
  owner_vehicleColor: string,

  owner_ownerName1: string,
  owner_ownerName2: string,
  owner_ownerAddress: string,
  owner_ownerCity: string,
  owner_ownerProvince: string,
  owner_ownerPostalCode: string,

  dateDifference: number,
  isProbableMatch: boolean
};

export function getOwnershipReconciliationRecords() {

  const addCalculatedFieldsFn = function(record: ReconciliationRecord) {

    record.ticket_issueDateString = dateTimeFns.dateIntegerToString(record.ticket_issueDate);
    record.owner_recordDateString = dateTimeFns.dateIntegerToString(record.owner_recordDate);

    record.owner_vehicleNCICMake = vehicleFns.getMakeFromNCIC(record.owner_vehicleNCIC);

    record.dateDifference = dateTimeFns.dateStringDifferenceInDays(record.ticket_issueDateString, record.owner_recordDateString);

    record.isProbableMatch =
      (record.ticket_vehicleMakeModel.toLowerCase() === record.owner_vehicleNCICMake.toLowerCase()) ||
      (record.ticket_vehicleMakeModel.toLowerCase() === record.owner_vehicleNCIC.toLowerCase());
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const records: ReconciliationRecord[] = db.prepare(
    "select t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +
    " t.ticketID as ticket_ticketID," +
    " t.ticketNumber as ticket_ticketNumber," +
    " t.issueDate as ticket_issueDate," +
    " t.vehicleMakeModel as ticket_vehicleMakeModel," +
    " o.recordDate as owner_recordDate," +
    " o.vehicleNCIC as owner_vehicleNCIC," +
    " o.vehicleYear as owner_vehicleYear," +
    " o.vehicleColor as owner_vehicleColor," +
    " o.ownerName1 as owner_ownerName1," +
    " o.ownerName2 as owner_ownerName2," +
    " o.ownerAddress as owner_ownerAddress," +
    " o.ownerCity as owner_ownerCity," +
    " o.ownerProvince as owner_ownerProvince," +
    " o.ownerPostalCode as owner_ownerPostalCode" +
    " from ParkingTickets t" +
    (" inner join LicencePlateOwners o" +
      " on t.licencePlateCountry = o.licencePlateCountry" +
      " and t.licencePlateProvince = o.licencePlateProvince" +
      " and t.licencePlateNumber = o.licencePlateNumber" +
      " and o.recordDelete_timeMillis is null" +
      " and o.vehicleNCIC <> ''" +
      (" and o.recordDate = (" +
        "select o2.recordDate from LicencePlateOwners o2" +
        " where t.licencePlateCountry = o2.licencePlateCountry" +
        " and t.licencePlateProvince = o2.licencePlateProvince" +
        " and t.licencePlateNumber = o2.licencePlateNumber" +
        " and o2.recordDelete_timeMillis is null" +
        " and t.issueDate <= o2.recordDate" +
        " order by o2.recordDate" +
        " limit 1)")) +
    " where t.recordDelete_timeMillis is null" +
    " and t.resolvedDate is null" +
    (" and not exists (" +
      "select 1 from ParkingTicketStatusLog s " +
      " where t.ticketID = s.ticketID " +
      " and s.statusKey in ('ownerLookupMatch', 'ownerLookupError')" +
      " and s.recordDelete_timeMillis is null)"))
    .all();

  db.close();

  records.forEach(addCalculatedFieldsFn);

  return records;
}

interface LookupErrorLogEntry extends pts.LicencePlate {
  batchID: number,
  logIndex: number,
  recordDate: number,
  recordDateString: string,
  errorCode: string,
  errorMessage: string,
  ticketID: number,
  ticketNumber: string,
  issueDate: number,
  issueDateString: string,
  vehicleMakeModel: string
};

export function getUnacknowledgedLicencePlateLookupErrorLog(batchID_or_negOne: number, logIndex_or_negOne: number) {

  const addCalculatedFieldsFn = function(record: LookupErrorLogEntry) {
    record.recordDateString = dateTimeFns.dateIntegerToString(record.recordDate);
    record.issueDateString = dateTimeFns.dateIntegerToString(record.issueDate);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  let params = [];

  if (batchID_or_negOne !== -1 && logIndex_or_negOne !== -1) {
    params = [batchID_or_negOne, logIndex_or_negOne];
  }

  const logEntries: LookupErrorLogEntry[] = db.prepare("select l.batchID, l.logIndex," +
    " l.licencePlateCountry, l.licencePlateProvince, l.licencePlateNumber, l.recordDate," +
    " l.errorCode, l.errorMessage," +
    " e.ticketID, t.ticketNumber, t.issueDate, t.vehicleMakeModel" +
    " from LicencePlateLookupErrorLog l" +
    (" inner join LicencePlateLookupBatches b" +
      " on l.batchID = b.batchID" +
      " and b.recordDelete_timeMillis is null") +
    (" inner join LicencePlateLookupBatchEntries e" +
      " on b.batchID = e.batchID" +
      " and l.licencePlateCountry = e.licencePlateCountry" +
      " and l.licencePlateProvince = e.licencePlateProvince" +
      " and l.licencePlateNumber = e.licencePlateNumber") +
    (" inner join ParkingTickets t" +
      " on e.ticketID = t.ticketID" +
      " and e.licencePlateCountry = t.licencePlateCountry" +
      " and e.licencePlateProvince = t.licencePlateProvince" +
      " and e.licencePlateNumber = t.licencePlateNumber" +
      " and t.recordDelete_timeMillis is null" +
      " and t.resolvedDate is null") +
    " where l.recordDelete_timeMillis is null" +
    " and l.isAcknowledged = 0" +
    (params.length > 0 ? " and l.batchID = ? and l.logIndex = ?" : "")
  )
    .all(params);

  db.close();

  logEntries.forEach(addCalculatedFieldsFn);

  return logEntries;
}


export function markLicencePlateLookupErrorLogEntryAcknowledged(batchID: number, logIndex: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const info = db.prepare("update LicencePlateLookupErrorLog" +
    " set isAcknowledged = 1," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and batchID = ?" +
    " and logIndex = ?" +
    " and isAcknowledged = 0")
    .run(reqSession.user.userName,
      Date.now(),
      batchID,
      logIndex);

  db.close();

  return info.changes > 0;
}
