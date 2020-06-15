export const dbPath = "data/parking.db";
import * as sqlite from "better-sqlite3";

import * as vehicleFns from "./vehicleFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as configFns from "./configFns";
import type * as pts from "./ptsTypes";


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


export interface GetParkingTicketsQueryOptions {
  isResolved?: boolean;
  ticketNumber?: string;
  licencePlateNumber?: string;
  location?: string;
  limit: number;
  offset: number;
}
export function getParkingTickets(reqSession: Express.Session, queryOptions: GetParkingTicketsQueryOptions) {

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
    " t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber, t.licencePlateIsMissing," +
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

  let licencePlateExpiryDate = dateTimeFns.dateStringToInteger(reqBody.licencePlateExpiryDateString);

  if (!configFns.getProperty("parkingTickets.licencePlateExpiryDate.includeDay")) {

    let licencePlateExpiryYear = parseInt(reqBody.licencePlateExpiryYear as string, 10) || 0;
    let licencePlateExpiryMonth = parseInt(reqBody.licencePlateExpiryMonth as string, 10) || 0;

    if (licencePlateExpiryYear === 0 && licencePlateExpiryMonth === 0) {
      licencePlateExpiryDate = 0;

    } else if (licencePlateExpiryYear === 0 || licencePlateExpiryMonth === 0) {

      db.close();

      return {
        success: false,
        message: "The licence plate expiry date fields must both be blank or both be completed."
      };

    } else {

      const dateObj = new Date(licencePlateExpiryYear,
        (licencePlateExpiryMonth - 1) + 1,
        (1 - 1),
        0, 0, 0, 0);

      licencePlateExpiryDate = dateTimeFns.dateToInteger(dateObj);

    }
  }

  const info = db.prepare("insert into ParkingTickets" +
    " (ticketNumber, issueDate, issueTime, issuingOfficer," +
    " locationKey, locationDescription," +
    " bylawNumber, parkingOffence, offenceAmount, discountOffenceAmount, discountDays," +
    " licencePlateCountry, licencePlateProvince, licencePlateNumber," +
    " licencePlateIsMissing, licencePlateExpiryDate, vehicleMakeModel, vehicleVIN," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reqBody.ticketNumber,
      issueDate,
      dateTimeFns.timeStringToInteger(reqBody.issueTimeString),
      reqBody.issuingOfficer,
      reqBody.locationKey,
      reqBody.locationDescription,
      reqBody.bylawNumber,
      reqBody.parkingOffence,
      reqBody.offenceAmount,
      reqBody.discountOffenceAmount,
      reqBody.discountDays,
      reqBody.licencePlateCountry,
      reqBody.licencePlateProvince,
      reqBody.licencePlateNumber,
      (reqBody.licencePlateIsMissing ? 1 : 0),
      licencePlateExpiryDate,
      reqBody.vehicleMakeModel,
      reqBody.vehicleVIN,
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

  let licencePlateExpiryDate = dateTimeFns.dateStringToInteger(reqBody.licencePlateExpiryDateString);

  if (!configFns.getProperty("parkingTickets.licencePlateExpiryDate.includeDay")) {

    let licencePlateExpiryYear = parseInt(reqBody.licencePlateExpiryYear as string, 10) || 0;
    let licencePlateExpiryMonth = parseInt(reqBody.licencePlateExpiryMonth as string, 10) || 0;

    if (licencePlateExpiryYear === 0 && licencePlateExpiryMonth === 0) {
      licencePlateExpiryDate = 0;

    } else if (licencePlateExpiryYear === 0 || licencePlateExpiryMonth === 0) {

      db.close();

      return {
        success: false,
        message: "The licence plate expiry date fields must both be blank or both be completed."
      };

    } else {

      const dateObj = new Date(licencePlateExpiryYear,
        (licencePlateExpiryMonth - 1) + 1,
        (1 - 1),
        0, 0, 0, 0);

      licencePlateExpiryDate = dateTimeFns.dateToInteger(dateObj);

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
    " discountOffenceAmount = ?," +
    " discountDays = ?," +
    " licencePlateCountry = ?," +
    " licencePlateProvince = ?," +
    " licencePlateNumber = ?," +
    " licencePlateIsMissing = ?," +
    " licencePlateExpiryDate = ?," +
    " vehicleMakeModel = ?," +
    " vehicleVIN = ?," +
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
      reqBody.discountOffenceAmount,
      reqBody.discountDays,
      reqBody.licencePlateCountry,
      reqBody.licencePlateProvince,
      reqBody.licencePlateNumber,
      (reqBody.licencePlateIsMissing ? 1 : 0),
      licencePlateExpiryDate,
      reqBody.vehicleMakeModel,
      reqBody.vehicleVIN,
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

export function restoreParkingTicket(ticketID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const info = db.prepare("update ParkingTickets" +
    " set recordDelete_userName = null," +
    " recordDelete_timeMillis = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where ticketID = ?" +
    " and recordDelete_timeMillis is not null")
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


// Parking Ticket Remarks


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


// Parking Ticket Statuses


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
    " statusKey, statusField, statusField2, statusNote," +
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
    " statusField, statusField2, statusNote," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(reqBodyOrObj.ticketID,
      statusIndexNew,
      dateTimeFns.dateToInteger(rightNow),
      dateTimeFns.dateToTimeInteger(rightNow),
      reqBodyOrObj.statusKey,
      reqBodyOrObj.statusField,
      reqBodyOrObj.statusField2,
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
    " statusField2 = ?," +
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
      reqBody.statusField2,
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


export interface GetLicencePlatesQueryOptions {
  licencePlateNumber?: string;
  hasOwnerRecord?: boolean;
  hasUnresolvedTickets?: boolean;
  limit: number;
  offset: number;
}

export function getLicencePlates(queryOptions: GetLicencePlatesQueryOptions) {

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

export function getAllLicencePlateOwners(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string) {

  const addCalculatedFieldsFn = function(record: pts.LicencePlateOwner) {
    record.recordDateString = dateTimeFns.dateIntegerToString(record.recordDate);
    record.vehicleMake = vehicleFns.getMakeFromNCIC(record.vehicleNCIC);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const owners: pts.LicencePlateOwner[] = db.prepare("select recordDate, vehicleNCIC, vehicleYear, vehicleColor," +
    " ownerName1, ownerName2, ownerAddress, ownerCity, ownerProvince, ownerPostalCode" +
    " from LicencePlateOwners" +
    " where recordDelete_timeMillis is null" +
    " and licencePlateCountry = ?" +
    " and licencePlateProvince = ?" +
    " and licencePlateNumber = ?" +
    " order by recordDate desc")
    .all(licencePlateCountry, licencePlateProvince, licencePlateNumber);

  db.close();

  owners.forEach(addCalculatedFieldsFn);

  return owners;
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


// Parking Locations


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

interface AddUpdateParkingLocationReturn {
  success: boolean;
  message?: string;
  locations?: pts.ParkingLocation[];
}

export function addParkingLocation(reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn {

  const db = sqlite(dbPath);

  // Check if key is already used

  const locationRecord: pts.ParkingLocation = db.prepare("select locationName, isActive" +
    " from ParkingLocations" +
    " where locationKey = ?")
    .get(reqBody.locationKey);

  if (locationRecord) {

    db.close();

    return {
      success: false,
      message:
        "The location key \"" + reqBody.locationKey + "\"" +
        " is already associated with the " +
        (locationRecord.isActive ? "" : "inactive ") +
        " record \"" + locationRecord.locationName + "\"."
    };

  }

  // Do insert

  const info = db.prepare("insert into ParkingLocations (" +
    "locationKey, locationName, locationClassKey, orderNumber, isActive)" +
    " values (?, ?, ?, 0, 1)")
    .run(reqBody.locationKey, reqBody.locationName, reqBody.locationClassKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function updateParkingLocation(reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingLocations" +
    " set locationName = ?," +
    " locationClassKey = ?" +
    " where locationKey = ?" +
    " and isActive = 1")
    .run(reqBody.locationName, reqBody.locationClassKey, reqBody.locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function deleteParkingLocation(locationKey: string): AddUpdateParkingLocationReturn {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingLocations" +
    " set isActive = 0" +
    " where locationKey = ?" +
    " and isActive = 1")
    .run(locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

}


// Parking By-Laws


export function getParkingBylaws() {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingBylaw[] = db.prepare("select bylawNumber, bylawDescription" +
    " from ParkingBylaws" +
    " where isActive = 1" +
    " order by orderNumber, bylawNumber")
    .all();

  db.close();

  return rows;

}


export function getParkingBylawsWithOffenceStats() {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingBylaw[] = db.prepare("select b.bylawNumber, b.bylawDescription," +
    " count(o.locationKey) as offenceCount," +
    " min(o.offenceAmount) as offenceAmountMin," +
    " max(o.offenceAmount) as offenceAmountMax," +
    " min(o.discountOffenceAmount) as discountOffenceAmountMin," +
    " max(o.discountOffenceAmount) as discountOffenceAmountMax," +
    " min(o.discountDays) as discountDaysMin," +
    " max(o.discountDays) as discountDaysMax" +
    " from ParkingBylaws b" +
    " left join ParkingOffences o on b.bylawNumber = o.bylawNumber and o.isActive = 1" +
    " where b.isActive = 1" +
    " group by b.bylawNumber, b.bylawDescription, b.orderNumber" +
    " order by b.orderNumber, b.bylawNumber")
    .all();

  db.close();

  return rows;

}

interface AddUpdateParkingBylawReturn {
  success: boolean;
  message?: string;
  bylaws?: pts.ParkingBylaw[];
}

export function addParkingBylaw(reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn {

  const db = sqlite(dbPath);

  // Check if key is already used

  const bylawRecord: pts.ParkingBylaw = db.prepare("select bylawDescription, isActive" +
    " from ParkingBylaws" +
    " where bylawNumber = ?")
    .get(reqBody.bylawNumber);

  if (bylawRecord) {

    if (bylawRecord.isActive) {

      db.close();

      return {
        success: false,
        message:
          "By-law number \"" + reqBody.bylawNumber + "\"" +
          " is already associated with the " +
          " record \"" + bylawRecord.bylawDescription + "\"."
      };

    }

    // Do update

    const info = db.prepare("update ParkingBylaws" +
      " set isActive = 1" +
      " where bylawNumber = ?")
      .run(reqBody.bylawNumber);

    db.close();

    return {
      success: (info.changes > 0),
      message: "By-law number \"" + reqBody.bylawNumber + "\" is associated with a previously removed record." +
        " That record has been restored with the original description."
    };

  }

  // Do insert

  const info = db.prepare("insert into ParkingBylaws (" +
    "bylawNumber, bylawDescription, orderNumber, isActive)" +
    " values (?, ?, 0, 1)")
    .run(reqBody.bylawNumber, reqBody.bylawDescription);

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function updateParkingBylaw(reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingBylaws" +
    " set bylawDescription = ?" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(reqBody.bylawDescription, reqBody.bylawNumber);

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function deleteParkingBylaw(bylawNumber: string): AddUpdateParkingBylawReturn {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingBylaws" +
    " set isActive = 0" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(bylawNumber);

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function updateParkingOffencesByBylawNumber(reqBody: any): AddUpdateParkingBylawReturn {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingOffences" +
    " set offenceAmount = ?," +
    " discountOffenceAmount = ?," +
    " discountDays = ?" +
    " where bylawNumber = ?" +
    " and isActive = 1")
    .run(reqBody.offenceAmount,
      reqBody.discountOffenceAmount,
      reqBody.discountDays,
      reqBody.bylawNumber);

  db.close();

  return {
    success: (info.changes > 0)
  };

}


// Parking Offences


export function getParkingOffences() {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingOffence[] = db.prepare(
    "select o.bylawNumber, o.locationKey, o.parkingOffence," +
    " o.offenceAmount, o.discountOffenceAmount, o.discountDays, o.accountNumber" +
    " from ParkingOffences o" +
    " left join ParkingLocations l on o.locationKey = l.locationKey" +
    " where o.isActive = 1 and l.isActive" +
    " and o.bylawNumber in (select b.bylawNumber from ParkingBylaws b where b.isActive = 1)" +
    " order by o.bylawNumber, l.locationName")
    .all();

  db.close();

  return rows;
}

export function getParkingOffencesByLocationKey(locationKey: string) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const rows: pts.ParkingOffence[] = db.prepare("select o.bylawNumber, b.bylawDescription," +
    " o.parkingOffence, o.offenceAmount, o.discountOffenceAmount, o.discountDays" +
    " from ParkingOffences o" +
    " left join ParkingBylaws b on o.bylawNumber = b.bylawNumber" +
    " where o.isActive = 1 and b.isActive = 1" +
    " and o.locationKey = ?" +
    " order by b.orderNumber, b.bylawNumber")
    .all(locationKey);

  db.close();

  return rows;
}

type addUpdateParkingOffence_return = {
  success: boolean,
  message?: string,
  offences?: pts.ParkingOffence[]
};

export function addParkingOffence(reqBody: pts.ParkingOffence): addUpdateParkingOffence_return {

  const db = sqlite(dbPath);

  // Check if offence already exists

  const existingOffenceRecord: pts.ParkingOffence = db.prepare("select isActive" +
    " from ParkingOffences" +
    " where bylawNumber = ?" +
    " and locationKey = ?")
    .get(reqBody.bylawNumber, reqBody.locationKey);

  if (existingOffenceRecord) {

    if (existingOffenceRecord.isActive) {

      db.close();

      return {
        success: false,
        message: "An active offence already exists for the same location and by-law."
      };

    } else {

      const info = db.prepare("update ParkingOffences" +
        " set isActive = 1" +
        " where bylawNumber = ?" +
        " and locationKey = ?").
        run(reqBody.bylawNumber, reqBody.locationKey);

      db.close();

      return {
        success: (info.changes > 0),
        message: "A previously deleted offence for the same location and by-law has been restored."
      };

    }

  }

  // Check if another offence exists for the same by-law
  // If so, use the same offenceAmount

  let offenceAmount = 0;
  let discountOffenceAmount: number = 0;
  let discountDays = 0;

  if (reqBody.hasOwnProperty("offenceAmount")) {

    offenceAmount = reqBody.offenceAmount;

    discountOffenceAmount = reqBody.hasOwnProperty("discountOffenceAmount") ?
      reqBody.discountOffenceAmount :
      reqBody.offenceAmount;

    discountDays = reqBody.discountDays || 0;

  } else {

    const offenceAmountRecord: pts.ParkingOffence = db.prepare(
      "select offenceAmount, discountOffenceAmount, discountDays" +
      " from ParkingOffences" +
      " where bylawNumber = ?" +
      " and isActive = 1" +
      " group by offenceAmount, discountOffenceAmount, discountDays" +
      " order by count(locationKey) desc, offenceAmount desc, discountOffenceAmount desc" +
      " limit 1")
      .get(reqBody.bylawNumber);

    if (offenceAmountRecord) {
      offenceAmount = offenceAmountRecord.offenceAmount;
      discountOffenceAmount = offenceAmountRecord.discountOffenceAmount;
      discountDays = offenceAmountRecord.discountDays;
    }
  }

  // Insert record

  const info = db.prepare("insert into ParkingOffences" +
    " (bylawNumber, locationKey, parkingOffence, offenceAmount, discountOffenceAmount, discountDays, accountNumber, isActive)" +
    " values (?, ?, ?, ?, ?, ?, ?, 1)")
    .run(reqBody.bylawNumber,
      reqBody.locationKey,
      reqBody.parkingOffence || "",
      offenceAmount,
      discountOffenceAmount,
      discountDays,
      reqBody.accountNumber || "");

  db.close();

  return {
    success: (info.changes > 0)
  };
}

export function updateParkingOffence(reqBody: pts.ParkingOffence): addUpdateParkingOffence_return {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingOffences" +
    " set parkingOffence = ?," +
    " offenceAmount = ?," +
    " discountOffenceAmount = ?," +
    " discountDays = ?," +
    " accountNumber = ?" +
    " where bylawNumber = ?" +
    " and locationKey = ?" +
    " and isActive = 1")
    .run(reqBody.parkingOffence,
      reqBody.offenceAmount,
      reqBody.discountOffenceAmount,
      reqBody.discountDays,
      reqBody.accountNumber,
      reqBody.bylawNumber,
      reqBody.locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function deleteParkingOffence(bylawNumber: string, locationKey: string): addUpdateParkingOffence_return {

  const db = sqlite(dbPath);

  // Do update

  const info = db.prepare("update ParkingOffences" +
    " set isActive = 0" +
    " where bylawNumber = ?" +
    " and locationKey = ?" +
    " and isActive = 1")
    .run(bylawNumber, locationKey);

  db.close();

  return {
    success: (info.changes > 0)
  };

}


// Conviction Batches


export function createParkingTicketConvictionBatch(reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("insert into ParkingTicketConvictionBatches" +
    " (batchDate, recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?)")
    .run(
      dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime()
    );

  db.close();

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
    };
  } else {
    return { success: false };
  }
}


export function getLastTenParkingTicketConvictionBatches() {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const batches: pts.ParkingTicketConvictionBatch[] = db.prepare("select batchID, batchDate, lockDate, sentDate," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
    " from ParkingTicketConvictionBatches" +
    " where recordDelete_timeMillis is null" +
    " order by batchID desc" +
    " limit 10").all();

  db.close();

  batches.forEach(function(batch) {

    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
  });

  return batches;
}


export function getParkingTicketConvictionBatch(batchID_or_negOne: number) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const baseBatchSQL = "select batchID, batchDate, lockDate, sentDate," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
    " from ParkingTicketConvictionBatches" +
    " where recordDelete_timeMillis is null";

  let batch: pts.ParkingTicketConvictionBatch;

  if (batchID_or_negOne === -1) {

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
    db.close();
    return null;
  }

  batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
  batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
  batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);

  batch.batchEntries = db.prepare("select s.statusIndex," +
    " s.statusDate, s.statusTime," +
    " t.ticketID, t.ticketNumber, t.issueDate," +
    " t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +
    " s.recordCreate_userName, s.recordCreate_timeMillis, s.recordUpdate_userName, s.recordUpdate_timeMillis" +
    " from ParkingTicketStatusLog s" +
    " left join ParkingTickets t on s.ticketID = t.ticketID" +
    " where s.recordDelete_timeMillis is null" +
    " and s.statusKey = 'convictionBatch' and s.statusField = ?" +
    " order by t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber")
    .all(batch.batchID.toString());

  batch.batchEntries.forEach(function(batchEntry) {
    batchEntry.statusDateString = dateTimeFns.dateIntegerToString(batchEntry.statusDate);
    batchEntry.statusTimeString = dateTimeFns.timeIntegerToString(batchEntry.statusTime);
    batchEntry.issueDateString = dateTimeFns.dateIntegerToString(batchEntry.issueDate);
  });

  db.close();

  return batch;
}


export function addParkingTicketToConvictionBatch(batchID: number, ticketID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  let lockedBatchCheck = db.prepare("select lockDate from ParkingTicketConvictionBatches" +
    " where recordDelete_timeMillis is null" +
    " and batchID = ?")
    .get(batchID);

  if (!lockedBatchCheck) {

    db.close();

    return {
      success: false,
      message: "The batch is unavailable."
    };

  } else if (lockedBatchCheck.lockDate) {

    db.close();

    return {
      success: false,
      message: "The batch is locked and cannot be updated."
    };
  }

  // Get the next status index

  let newStatusIndex = db.prepare("select ifnull(max(statusIndex), -1) + 1 as newStatusIndex" +
    " from ParkingTicketStatusLog" +
    " where ticketID = ?")
    .get(ticketID)
    .newStatusIndex;

  // Prepare for inserts

  const rightNow = new Date();

  const statusDate = dateTimeFns.dateToInteger(rightNow);
  const statusTime = dateTimeFns.dateToTimeInteger(rightNow);
  const timeMillis = rightNow.getTime();

  // Check if the ticket has been convicted or not

  let convictedStatusCheck = db.prepare("select statusIndex from ParkingTicketStatusLog" +
    " where recordDelete_timeMillis is null" +
    " and ticketID = ?" +
    " and statusKey = 'convicted'")
    .get(ticketID);

  if (!convictedStatusCheck) {

    // If not convicted, convict it now

    db.prepare("insert into ParkingTicketStatusLog" +
      " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(ticketID, newStatusIndex, statusDate, statusTime, "convicted", batchID.toString(), "",
        reqSession.user.userName, timeMillis, reqSession.user.userName, timeMillis);

    newStatusIndex += 1;

  }

  // Check if the ticket is part of another conviction batch

  const batchStatusCheck = db.prepare("select statusField from ParkingTicketStatusLog" +
    " where recordDelete_timeMillis is null" +
    " and ticketID = ?" +
    " and statusKey = 'convictionBatch'")
    .get(ticketID);

  if (!batchStatusCheck) {

    // No record, add to batch now

    db.prepare("insert into ParkingTicketStatusLog" +
      " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(ticketID, newStatusIndex, statusDate, statusTime, "convictionBatch", batchID.toString(), "",
        reqSession.user.userName, timeMillis, reqSession.user.userName, timeMillis);

    db.close();

    return {
      success: true
    };

  }

  db.close();

  if (batchStatusCheck.statusField === batchID.toString()) {

    // Already part of the batch
    return {
      success: true
    };

  } else {

    // Part of a different batch
    return {
      success: false,
      message: "Parking ticket already included in conviction batch #" + batchStatusCheck.statusField + "."
    };
  }
}


export function addAllParkingTicketsToConvictionBatch(batchID: number, ticketIDs: number[], reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  let lockedBatchCheck = db.prepare("select lockDate from ParkingTicketConvictionBatches" +
    " where recordDelete_timeMillis is null" +
    " and batchID = ?")
    .get(batchID);

  if (!lockedBatchCheck) {

    db.close();

    return {
      successCount: 0,
      message: "The batch is unavailable."
    };

  } else if (lockedBatchCheck.lockDate) {

    db.close();

    return {
      successCount: 0,
      message: "The batch is locked and cannot be updated."
    };
  }

  // Prepare for inserts

  const rightNow = new Date();

  const statusDate = dateTimeFns.dateToInteger(rightNow);
  const statusTime = dateTimeFns.dateToTimeInteger(rightNow);
  const timeMillis = rightNow.getTime();

  // Loop through ticketIDs

  let successCount = 0;

  for (let index = 0; index < ticketIDs.length; index += 1) {

    const ticketID = ticketIDs[index];

    // Get the next status index

    let newStatusIndex = db.prepare("select ifnull(max(statusIndex), -1) + 1 as newStatusIndex" +
      " from ParkingTicketStatusLog" +
      " where ticketID = ?")
      .get(ticketID)
      .newStatusIndex;

    // Check if the ticket has been convicted or not

    let convictedStatusCheck = db.prepare("select statusIndex from ParkingTicketStatusLog" +
      " where recordDelete_timeMillis is null" +
      " and ticketID = ?" +
      " and statusKey = 'convicted'")
      .get(ticketID);

    if (!convictedStatusCheck) {

      // If not convicted, convict it now

      db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(ticketID, newStatusIndex, statusDate, statusTime, "convicted", batchID.toString(), "",
          reqSession.user.userName, timeMillis, reqSession.user.userName, timeMillis);

      newStatusIndex += 1;

    }

    // Check if the ticket is part of another conviction batch

    const batchStatusCheck = db.prepare("select statusField from ParkingTicketStatusLog" +
      " where recordDelete_timeMillis is null" +
      " and ticketID = ?" +
      " and statusKey = 'convictionBatch'")
      .get(ticketID);

    if (!batchStatusCheck) {

      // No record, add to batch now

      db.prepare("insert into ParkingTicketStatusLog" +
        " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(ticketID, newStatusIndex, statusDate, statusTime, "convictionBatch", batchID.toString(), "",
          reqSession.user.userName, timeMillis, reqSession.user.userName, timeMillis);

      successCount += 1;

    } else if (batchStatusCheck.statusField === batchID.toString()) {

      successCount += 1;

    }

  }

  db.close();

  return {
    successCount: successCount
  };

}


export function removeParkingTicketFromConvictionBatch(batchID: number, ticketID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  let lockedBatchCheck = db.prepare("select lockDate from ParkingTicketConvictionBatches" +
    " where recordDelete_timeMillis is null" +
    " and batchID = ?")
    .get(batchID);

  if (!lockedBatchCheck) {

    db.close();

    return {
      success: false,
      message: "The batch is unavailable."
    };

  } else if (lockedBatchCheck.lockDate) {

    db.close();

    return {
      success: false,
      message: "The batch is locked and cannot be updated."
    };
  }

  // Update statuses

  const rightNowMillis = Date.now();

  const info = db.prepare("update ParkingTicketStatusLog" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and ticketID = ?" +
    " and statusKey in ('convicted', 'convictionBatch')" +
    " and statusField = ?")
    .run(reqSession.user.userName, rightNowMillis, ticketID, batchID.toString());

  db.close();

  return {
    success: (info.changes > 0)
  };

}


export function clearConvictionBatch(batchID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  let lockedBatchCheck = db.prepare("select lockDate from ParkingTicketConvictionBatches" +
    " where recordDelete_timeMillis is null" +
    " and batchID = ?")
    .get(batchID);

  if (!lockedBatchCheck) {

    db.close();

    return {
      success: false,
      message: "The batch is unavailable."
    };

  } else if (lockedBatchCheck.lockDate) {

    db.close();

    return {
      success: false,
      message: "The batch is locked and cannot be updated."
    };
  }

  // Update statuses

  const rightNowMillis = Date.now();

  const info = db.prepare("update ParkingTicketStatusLog" +
    " set recordDelete_userName = ?," +
    " recordDelete_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and statusKey in ('convicted', 'convictionBatch')" +
    " and statusField = ?")
    .run(reqSession.user.userName, rightNowMillis, batchID.toString());

  db.close();

  return {
    success: (info.changes > 0)
  };

}


export function lockConvictionBatch(batchID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const lockDate = dateTimeFns.dateToInteger(rightNow);

  let info = db.prepare("update ParkingTicketConvictionBatches" +
    " set lockDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and batchID = ?" +
    " and lockDate is null")
    .run(lockDate, reqSession.user.userName, rightNow.getTime(), batchID);

  db.close();

  return {
    success: (info.changes > 0),
    lockDate: lockDate,
    lockDateString: dateTimeFns.dateIntegerToString(lockDate)
  };

}


export function unlockConvictionBatch(batchID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const rightNowMillis = Date.now();

  let info = db.prepare("update ParkingTicketConvictionBatches" +
    " set lockDate = null," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and batchID = ?" +
    " and lockDate is not null" +
    " and sentDate is null")
    .run(reqSession.user.userName, rightNowMillis, batchID);

  db.close();

  return (info.changes > 0);

}


export function markConvictionBatchAsSent(batchID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("update ParkingTicketConvictionBatches" +
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

  db.prepare("update ParkingTickets" +
    " set resolvedDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where resolvedDate is null" +
    (" and exists (" +
      "select 1 from ParkingTicketStatusLog s" +
      " where ParkingTickets.ticketID = s.ticketID" +
      " and s.recordDelete_timeMillis is null" +
      " and s.statusField = ?" +
      ")"))
    .run(dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      batchID.toString());

  db.close();

  return (info.changes > 0);
}
