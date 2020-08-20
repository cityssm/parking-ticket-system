import * as sqlite from "better-sqlite3";

import * as vehicleFns from "./vehicleFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as configFns from "./configFns";
import type * as pts from "./ptsTypes";

export const dbPath = "data/parking.db";


export const canUpdateObject = (obj: pts.Record, reqSession: Express.Session) => {

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

        if ((obj as pts.ParkingTicket).resolvedDate) {
          canUpdate = false;
        }
        break;
    }

  }

  return canUpdate;
};


export const getParkingLocationWithDB = (db: sqlite.Database, locationKey: string) => {

  const location: pts.ParkingLocation = db.prepare("select locationKey, locationName, locationClassKey, isActive" +
    " from ParkingLocations" +
    " where locationKey = ?")
    .get(locationKey);

  return location;

};


export const getLicencePlateOwnerWithDB =
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


export const getParkingTicketsByLicencePlate =
  (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string,
    reqSession: Express.Session) => {

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

      ticket.canUpdate = canUpdateObject(ticket, reqSession);
    }

    return tickets;
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
    return ticketRow.ticketID as number;
  }

  return null;
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

  const remarkIndexNew = (db.prepare("select ifnull(max(remarkIndex), 0) as remarkIndexMax" +
    " from ParkingTicketRemarks" +
    " where ticketID = ?")
    .get(reqBody.ticketID)
    .remarkIndexMax as number) + 1;

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

    const statusIndexNew =
      (db.prepare("select ifnull(max(statusIndex), 0) as statusIndexMax" +
        " from ParkingTicketStatusLog" +
        " where ticketID = ?")
        .get(reqBodyOrObj.ticketID)
        .statusIndexMax as number) + 1;

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
    " sum(case when resolvedDate is null then 1 else 0 end) as unresolvedTicketCountInternal," +
    " 0 as hasOwnerRecordInternal" +
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
    " limit " + queryOptions.limit.toString() +
    " offset " + queryOptions.offset.toString())
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

    const ownerRecord =
      getLicencePlateOwnerWithDB(db, licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDateOrBefore);

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

  const rows: Array<{
    vehicleNCIC: string;
    recordDateMax: number;
  }> = db.prepare("select vehicleNCIC, max(recordDate) as recordDateMax" +
    " from LicencePlateOwners" +
    " where recordDate >= ?" +
    " group by vehicleNCIC" +
    " order by recordDateMax desc")
    .all(cutoffDate);

  db.close();

  return rows;

};
