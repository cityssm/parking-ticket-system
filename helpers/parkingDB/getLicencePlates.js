"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicencePlates = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const parkingDB_1 = require("../parkingDB");
exports.getLicencePlates = (queryOptions) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    let sqlParams = [];
    let sqlInnerWhereClause = " where recordDelete_timeMillis is null";
    if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {
        const filter = parkingDB_1.getSplitWhereClauseFilter("licencePlateNumber", queryOptions.licencePlateNumber);
        sqlInnerWhereClause += filter.sqlWhereClause;
        sqlParams.push.apply(sqlParams, filter.sqlParams);
    }
    sqlParams = sqlParams.concat(sqlParams);
    let sqlHavingClause = " having 1 = 1";
    if (queryOptions.hasOwnProperty("hasOwnerRecord")) {
        if (queryOptions.hasOwnerRecord) {
            sqlHavingClause += " and hasOwnerRecord = 1";
        }
        else {
            sqlHavingClause += " and hasOwnerRecord = 0";
        }
    }
    if (queryOptions.hasOwnProperty("hasUnresolvedTickets")) {
        if (queryOptions.hasUnresolvedTickets) {
            sqlHavingClause += " and unresolvedTicketCount > 0";
        }
        else {
            sqlHavingClause += " and unresolvedTicketCount = 0";
        }
    }
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
    const count = db.prepare("select ifnull(count(*), 0) as cnt" +
        " from (" + innerSql + ")")
        .get(sqlParams)
        .cnt;
    const rows = db.prepare(innerSql +
        " order by licencePlateNumber, licencePlateProvince, licencePlateCountry" +
        " limit " + queryOptions.limit.toString() +
        " offset " + queryOptions.offset.toString())
        .all(sqlParams);
    db.close();
    return {
        count,
        limit: queryOptions.limit,
        offset: queryOptions.offset,
        licencePlates: rows
    };
};
