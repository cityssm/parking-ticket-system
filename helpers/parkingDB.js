"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite = require("better-sqlite3");
const dbPath = "data/parking.db";
const dateTimeFns = require("./dateTimeFns");
const configFns = require("./configFns");
function canUpdateObject(obj, reqSession) {
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
}
function getParkingTickets(reqSession, queryOptions) {
    const addCalculatedFieldsFn = function (ele) {
        ele.recordType = "ticket";
        ele.issueDateString = dateTimeFns.dateIntegerToString(ele.issueDate);
        ele.resolvedDateString = dateTimeFns.dateIntegerToString(ele.resolvedDate);
        ele.canUpdate = canUpdateObject(ele, reqSession);
    };
    const db = sqlite(dbPath, {
        readonly: true
    });
    const sqlParams = [];
    let sqlWhereClause = " where t.recordDelete_timeMillis is null";
    if (queryOptions.hasOwnProperty("isResolved")) {
        if (queryOptions.isResolved) {
            sqlWhereClause += " and t.resolvedDate is not null";
        }
        else {
            sqlWhereClause += " and t.resolvedDate is null";
        }
    }
    const count = db.prepare("select ifnull(count(*), 0) as cnt" +
        " from ParkingTickets t" +
        sqlWhereClause)
        .get(sqlParams)
        .cnt;
    const rows = db.prepare("select t.ticketID, t.ticketNumber, t.issueDate," +
        " t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +
        " l.locationName, l.locationClassKey, t.locationDescription," +
        " t.parkingOffence, t.offenceAmount, t.resolvedDate," +
        " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +
        " from ParkingTickets t" +
        " left join ParkingLocations l on t.locationKey = l.locationKey" +
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
exports.getParkingTickets = getParkingTickets;
