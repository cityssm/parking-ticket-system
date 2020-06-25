export const dbPath = "data/parking.db";
import * as sqlite from "better-sqlite3";

import * as vehicleFns from "./vehicleFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as configFns from "./configFns";
import type * as pts from "./ptsTypes";


const canUpdateObject = (obj: pts.Record, reqSession: Express.Session) => {

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
};


const getParkingLocationWithDB = (db: sqlite.Database, locationKey: string) => {

  const location: pts.ParkingLocation = db.prepare("select locationKey, locationName, locationClassKey, isActive" +
    " from ParkingLocations" +
    " where locationKey = ?")
    .get(locationKey);

  return location;

};


const getLicencePlateOwnerWithDB =
  (db: sqlite.Database,
    licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string,
    recordDateOrBefore: number) => {

    const licencePlateCountryAlias =
      configFns.getProperty("licencePlateCountryAliases")[licencePlateCountry] || licencePlateCountry;

    const licencePlateProvinceAlias =
      (configFns.getProperty("licencePlateProvinceAliases")[licencePlateCountryAlias] || {})
      [licencePlateProvince] || licencePlateProvince;

    const possibleOwners: pts.LicencePlateOwner[] = db.prepare("select * from LicencePlateOwners" +
      " where recordDelete_timeMillis is null" +
      " and licencePlateNumber = ?" +
      " and recordDate >= ?" +
      " order by recordDate")
      .all(licencePlateNumber, recordDateOrBefore);

    for (const possibleOwnerObj of possibleOwners) {

      const ownerPlateCountryAlias =
        configFns.getProperty("licencePlateCountryAliases")[possibleOwnerObj.licencePlateCountry] ||
        possibleOwnerObj.licencePlateCountry;

      const ownerPlateProvinceAlias =
        (configFns.getProperty("licencePlateProvinceAliases")[ownerPlateCountryAlias] || {})
        [possibleOwnerObj.licencePlateProvince] || possibleOwnerObj.licencePlateProvince;

      if (licencePlateCountryAlias === ownerPlateCountryAlias &&
        licencePlateProvinceAlias === ownerPlateProvinceAlias) {

        possibleOwnerObj.recordDateString = dateTimeFns.dateIntegerToString(possibleOwnerObj.recordDate);

        possibleOwnerObj.licencePlateExpiryDateString =
          dateTimeFns.dateIntegerToString(possibleOwnerObj.licencePlateExpiryDate);

        possibleOwnerObj.vehicleMake = vehicleFns.getMakeFromNCIC(possibleOwnerObj.vehicleNCIC);

        return possibleOwnerObj;
      }
    }

    return null;
  };


export interface GetParkingTicketsQueryOptions {
  isResolved?: boolean;
  ticketNumber?: string;
  licencePlateNumber?: string;
  location?: string;
  limit: number;
  offset: number;
}


export const getParkingTickets = (reqSession: Express.Session, queryOptions: GetParkingTicketsQueryOptions) => {

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

    " left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
    (" and s.statusIndex = (" +
      "select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID" +
      " order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)") +

    sqlWhereClause +
    " order by t.issueDate desc, t.ticketNumber desc" +
    " limit " + queryOptions.limit +
    " offset " + queryOptions.offset)
    .all(sqlParams);

  db.close();

  for (const ticket of rows) {

    ticket.recordType = "ticket";

    ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
    ticket.resolvedDateString = dateTimeFns.dateIntegerToString(ticket.resolvedDate);

    ticket.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(ticket.latestStatus_statusDate);

    ticket.canUpdate = canUpdateObject(ticket, reqSession);
  }

  return {
    count,
    tickets: rows
  };
};


export const getParkingTicketsByLicencePlate =
  (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, reqSession: Express.Session) => {

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

    for (const ticket of tickets) {

      ticket.recordType = "ticket";

      ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate);
      ticket.resolvedDateString = dateTimeFns.dateIntegerToString(ticket.resolvedDate);

      ticket.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(ticket.latestStatus_statusDate);

      ticket.canUpdate = canUpdateObject(ticket, reqSession);
    }

    return tickets;
  };


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


export const getParkingTicketID = (ticketNumber: string) => {

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
};


export const createParkingTicket = (reqBody: pts.ParkingTicket, reqSession: Express.Session) => {

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
};


export const updateParkingTicket = (reqBody: pts.ParkingTicket, reqSession: Express.Session) => {

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

};


export const deleteParkingTicket = (ticketID: number, reqSession: Express.Session) => {

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
};


export const resolveParkingTicket = (ticketID: number, reqSession: Express.Session) => {

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
};


export const unresolveParkingTicket = (ticketID: number, reqSession: Express.Session) => {

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
};


export const restoreParkingTicket = (ticketID: number, reqSession: Express.Session) => {

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
};


export const getRecentParkingTicketVehicleMakeModelValues = () => {

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

  for (const row of rows) {
    vehicleMakeModelList.push(row.vehicleMakeModel);
  }

  return vehicleMakeModelList;

};


// Parking Ticket Remarks


export const getParkingTicketRemarks = (ticketID: number, reqSession: Express.Session) => {

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

  for (const remark of remarkRows) {

    remark.recordType = "remark";

    remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate);
    remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime);

    remark.canUpdate = canUpdateObject(remark, reqSession);
  }

  return remarkRows;
};


export const createParkingTicketRemark = (reqBody: pts.ParkingTicketRemark, reqSession: Express.Session) => {

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

};


export const updateParkingTicketRemark = (reqBody: pts.ParkingTicketRemark, reqSession: Express.Session) => {

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
};


export const deleteParkingTicketRemark = (ticketID: number, remarkIndex: number, reqSession: Express.Session) => {

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
};


// Parking Ticket Statuses


export const getParkingTicketStatuses = (ticketID: number, reqSession: Express.Session) => {

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

  for (const status of statusRows) {

    status.recordType = "status";

    status.statusDateString = dateTimeFns.dateIntegerToString(status.statusDate);
    status.statusTimeString = dateTimeFns.timeIntegerToString(status.statusTime);

    status.canUpdate = canUpdateObject(status, reqSession);
  }

  return statusRows;
};


export const createParkingTicketStatus =
  (reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: Express.Session, resolveTicket: boolean) => {

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

  };


export const updateParkingTicketStatus = (reqBody: pts.ParkingTicketStatusLog, reqSession: Express.Session) => {

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
};


export const deleteParkingTicketStatus = (ticketID: number, statusIndex: number, reqSession: Express.Session) => {

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
};


// Licence Plates


export interface GetLicencePlatesQueryOptions {
  licencePlateNumber?: string;
  hasOwnerRecord?: boolean;
  hasUnresolvedTickets?: boolean;
  limit: number;
  offset: number;
}


export const getLicencePlates = (queryOptions: GetLicencePlatesQueryOptions) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  // build where clause

  let sqlParams = [];

  let sqlInnerWhereClause = " where recordDelete_timeMillis is null";

  if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {

    const licencePlateNumberPieces = queryOptions.licencePlateNumber.toLowerCase().split(" ");

    for (const licencePlateNumberPiece of licencePlateNumberPieces) {
      sqlInnerWhereClause += " and instr(lower(licencePlateNumber), ?)";
      sqlParams.push(licencePlateNumberPiece);
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

  const count: number = db.prepare("select ifnull(count(*), 0) as cnt" +
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
    count,
    licencePlates: rows
  };

};


export const getLicencePlateOwner =
  (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string,
    recordDateOrBefore: number) => {

    const db = sqlite(dbPath, {
      readonly: true
    });

    const ownerRecord = getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);

    db.close();

    return ownerRecord;

  };


export const getAllLicencePlateOwners =
  (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string) => {

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

    for (const owner of owners) {
      owner.recordDateString = dateTimeFns.dateIntegerToString(owner.recordDate);
      owner.vehicleMake = vehicleFns.getMakeFromNCIC(owner.vehicleNCIC);
    }

    return owners;
  };


export const getDistinctLicencePlateOwnerVehicleNCICs = (cutoffDate: number) => {

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

};
