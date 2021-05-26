import sqlite from "better-sqlite3";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as configFns from "./configFns.js";
import { parkingDB as dbPath } from "../data/databasePaths.js";
export const canUpdateObject = (obj, reqSession) => {
    const userProperties = reqSession.user.userProperties;
    let canUpdate = false;
    if (!reqSession) {
        canUpdate = false;
    }
    else if (obj.recordDelete_timeMillis) {
        canUpdate = false;
    }
    else if (userProperties.canUpdate) {
        canUpdate = true;
    }
    else if (userProperties.canCreate &&
        (obj.recordCreate_userName === reqSession.user.userName ||
            obj.recordUpdate_userName === reqSession.user.userName) &&
        obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {
        canUpdate = true;
    }
    if (obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {
        return canUpdate;
    }
    if (canUpdate) {
        switch (obj.recordType) {
            case "ticket":
                if (obj.resolvedDate) {
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
export const getSplitWhereClauseFilter = (columnName, searchString) => {
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
export const getDistinctLicencePlateOwnerVehicleNCICs = (cutoffDate) => {
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
