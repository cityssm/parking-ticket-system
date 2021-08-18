import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFunctions from "./functions.config.js";
import { parkingDB as databasePath } from "../data/databasePaths.js";
export const canUpdateObject = (object, requestSession) => {
    const userProperties = requestSession.user.userProperties;
    let canUpdate = false;
    if (!requestSession) {
        canUpdate = false;
    }
    else if (object.recordDelete_timeMillis) {
        canUpdate = false;
    }
    else if (userProperties.canUpdate) {
        canUpdate = true;
    }
    else if (userProperties.canCreate &&
        (object.recordCreate_userName === requestSession.user.userName ||
            object.recordUpdate_userName === requestSession.user.userName) &&
        object.recordUpdate_timeMillis + configFunctions.getProperty("user.createUpdateWindowMillis") > Date.now()) {
        canUpdate = true;
    }
    if (object.recordUpdate_timeMillis + configFunctions.getProperty("user.createUpdateWindowMillis") > Date.now()) {
        return canUpdate;
    }
    if (canUpdate) {
        switch (object.recordType) {
            case "ticket":
                if (object.resolvedDate) {
                    canUpdate = false;
                }
                break;
        }
    }
    return canUpdate;
};
export const getRecentParkingTicketVehicleMakeModelValues = () => {
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
    const vehicleMakeModelList = [];
    for (const row of rows) {
        vehicleMakeModelList.push(row.vehicleMakeModel);
    }
    return vehicleMakeModelList;
};
export const getSplitWhereClauseFilter = (columnName, searchString) => {
    let sqlWhereClause = "";
    const sqlParameters = [];
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
export const getDistinctLicencePlateOwnerVehicleNCICs = (cutoffDate) => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const rows = database.prepare("select vehicleNCIC, max(recordDate) as recordDateMax" +
        " from LicencePlateOwners" +
        " where recordDate >= ?" +
        " group by vehicleNCIC" +
        " order by recordDateMax desc")
        .all(cutoffDate);
    database.close();
    return rows;
};
