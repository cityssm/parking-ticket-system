import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../data/databasePaths.js';
import * as configFunctions from '../helpers/functions.config.js';
export const canUpdateObject = (object, sessionUser) => {
    let canUpdate = false;
    if ((sessionUser ?? undefined) === undefined) {
        canUpdate = false;
    }
    else if ((object.recordDelete_timeMillis ?? undefined) !== undefined) {
        canUpdate = false;
    }
    else if (sessionUser.canUpdate) {
        canUpdate = true;
    }
    if (canUpdate) {
        switch (object.recordType) {
            case 'ticket': {
                if (object.resolvedDate &&
                    Date.now() - object.recordUpdate_timeMillis >=
                        configFunctions.getProperty('parkingTickets.updateWindowMillis')) {
                    canUpdate = false;
                }
                break;
            }
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
    const rows = database
        .prepare('select vehicleMakeModel' +
        ' from ParkingTickets' +
        ' where recordDelete_timeMillis is null' +
        ' and issueDate > ?' +
        ' group by vehicleMakeModel' +
        ' having count(vehicleMakeModel) > 3' +
        ' order by vehicleMakeModel')
        .all(issueDate);
    database.close();
    const vehicleMakeModelList = [];
    for (const row of rows) {
        vehicleMakeModelList.push(row.vehicleMakeModel);
    }
    return vehicleMakeModelList;
};
export const getSplitWhereClauseFilter = (columnName, searchString) => {
    let sqlWhereClause = '';
    const sqlParameters = [];
    const ticketNumberPieces = searchString.toLowerCase().split(' ');
    for (const ticketNumberPiece of ticketNumberPieces) {
        sqlWhereClause += ' and instr(lower(' + columnName + '), ?)';
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
    const rows = database
        .prepare('select vehicleNCIC, max(recordDate) as recordDateMax' +
        ' from LicencePlateOwners' +
        ' where recordDate >= ?' +
        ' group by vehicleNCIC' +
        ' order by recordDateMax desc')
        .all(cutoffDate);
    database.close();
    return rows;
};
