import sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFunctions from "./functions.config.js";

import { parkingDB as databasePath } from "../data/databasePaths.js";

import type * as recordTypes from "../types/recordTypes";
import type * as expressSession from "express-session";


export const canUpdateObject = (object: recordTypes.Record, requestSession: expressSession.Session): boolean => {

  const userProperties: recordTypes.UserProperties = requestSession.user.userProperties;

  // check user permissions

  let canUpdate = false;

  if (!requestSession) {

    canUpdate = false;

  } else if (object.recordDelete_timeMillis) {

    // Deleted records cannot be updated
    canUpdate = false;

  } else if (userProperties.canUpdate) {

    canUpdate = true;

  } else if (userProperties.canCreate &&
    (object.recordCreate_userName === requestSession.user.userName ||
      object.recordUpdate_userName === requestSession.user.userName) &&
    object.recordUpdate_timeMillis + configFunctions.getProperty("user.createUpdateWindowMillis") > Date.now()) {

    // Users with only create permission can update their own records within the time window
    canUpdate = true;

  }

  // If recently updated, send back permission

  if (object.recordUpdate_timeMillis + configFunctions.getProperty("user.createUpdateWindowMillis") > Date.now()) {

    return canUpdate;

  }

  if (canUpdate) {

    switch (object.recordType) {

      case "ticket":

        if ((object as recordTypes.ParkingTicket).resolvedDate) {
          canUpdate = false;
        }
        break;
    }

  }

  return canUpdate;
};


export const getRecentParkingTicketVehicleMakeModelValues = (): string[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const issueDate = dateTimeFns.dateToInteger(sixMonthsAgo);

  const rows = database.prepare("select vehicleMakeModel" +
    " from ParkingTickets" +
    " where recordDelete_timeMillis is null" +
    " and issueDate > ?" +
    " group by vehicleMakeModel" +
    " having count(vehicleMakeModel) > 3" +
    " order by vehicleMakeModel")
    .all(issueDate);

  database.close();

  const vehicleMakeModelList: string[] = [];

  for (const row of rows) {
    vehicleMakeModelList.push(row.vehicleMakeModel);
  }

  return vehicleMakeModelList;

};

interface GetSplitWhereClauseFilterReturn {
  sqlWhereClause: string;
  sqlParams: string[];
}

export const getSplitWhereClauseFilter = (columnName: string, searchString: string): GetSplitWhereClauseFilterReturn => {

  let sqlWhereClause = "";
  const sqlParameters: string[] = [];

  const ticketNumberPieces = searchString.toLowerCase().split(" ");

  for (const ticketNumberPiece of ticketNumberPieces) {
    sqlWhereClause += " and instr(lower(" + columnName + "), ?)";
    sqlParameters.push(ticketNumberPiece);
  }

  return {
    sqlWhereClause,
    sqlParams: sqlParameters
  };
};


// Licence Plates

interface GetDistinctLicencePlateOwnerVehicleNCICsReturn {
  vehicleNCIC: string;
  recordDateMax: number;
}

export const getDistinctLicencePlateOwnerVehicleNCICs = (cutoffDate: number): GetDistinctLicencePlateOwnerVehicleNCICsReturn[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const rows: GetDistinctLicencePlateOwnerVehicleNCICsReturn[] = database.prepare("select vehicleNCIC, max(recordDate) as recordDateMax" +
    " from LicencePlateOwners" +
    " where recordDate >= ?" +
    " group by vehicleNCIC" +
    " order by recordDateMax desc")
    .all(cutoffDate);

  database.close();

  return rows;
};
