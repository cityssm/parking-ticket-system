import * as sqlite from "better-sqlite3";

import { parkingDB as dbPath } from "../../data/databasePaths";

import { getSplitWhereClauseFilter } from "../parkingDB";

import * as pts from "../ptsTypes";


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

    const filter = getSplitWhereClauseFilter("licencePlateNumber", queryOptions.licencePlateNumber);
    sqlInnerWhereClause += filter.sqlWhereClause;
    sqlParams.push.apply(sqlParams, filter.sqlParams);
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

  const rows: pts.LicencePlate[] = db.prepare(innerSql +
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
