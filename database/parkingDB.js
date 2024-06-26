import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../data/databasePaths.js';
import { getConfigProperty } from '../helpers/functions.config.js';
export function canUpdateObject(object, sessionUser) {
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
                        getConfigProperty('parkingTickets.updateWindowMillis')) {
                    canUpdate = false;
                }
                break;
            }
            default:
        }
    }
    return canUpdate;
}
export function getRecentParkingTicketVehicleMakeModelValues() {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const issueDate = dateToInteger(sixMonthsAgo);
    const rows = database
        .prepare(`select vehicleMakeModel
        from ParkingTickets
        where recordDelete_timeMillis is null
        and issueDate > ?
        group by vehicleMakeModel
        having count(vehicleMakeModel) > 3
        order by vehicleMakeModel`)
        .all(issueDate);
    database.close();
    const vehicleMakeModelList = [];
    for (const row of rows) {
        vehicleMakeModelList.push(row.vehicleMakeModel);
    }
    return vehicleMakeModelList;
}
export function getSplitWhereClauseFilter(columnName, searchString) {
    let sqlWhereClause = '';
    const sqlParameters = [];
    const ticketNumberPieces = searchString.toLowerCase().split(' ');
    for (const ticketNumberPiece of ticketNumberPieces) {
        sqlWhereClause += ` and instr(lower(${columnName}), ?)`;
        sqlParameters.push(ticketNumberPiece);
    }
    return {
        sqlWhereClause,
        sqlParams: sqlParameters
    };
}
export function getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const rows = database
        .prepare(`select vehicleNCIC, max(recordDate) as recordDateMax
        from LicencePlateOwners
        where recordDate >= ?
        group by vehicleNCIC
        order by recordDateMax desc`)
        .all(cutoffDate);
    database.close();
    return rows;
}
