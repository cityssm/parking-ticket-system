import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as configFns from "./configFns";
import type * as pts from "./ptsTypes";

import { parkingDB as dbPath } from "../data/databasePaths";


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


export const getSplitWhereClauseFilter = (columnName: string, searchString: string) => {

  let sqlWhereClause = "";
  const sqlParams = [];

  const ticketNumberPieces = searchString.toLowerCase().split(" ");

  for (const ticketNumberPiece of ticketNumberPieces) {
    sqlWhereClause += " and instr(lower(" + columnName + "), ?)";
    sqlParams.push(ticketNumberPiece);
  }

  return {
    sqlWhereClause,
    sqlParams
  };
};


// Licence Plates


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
