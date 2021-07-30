import sqlite from "better-sqlite3";

import { parkingDB as databasePath } from "../../data/databasePaths.js";

import { getSplitWhereClauseFilter } from "../parkingDB.js";

import type * as pts from "../../types/recordTypes";


export interface GetLicencePlatesQueryOptions {
  licencePlateNumber?: string;
  hasOwnerRecord?: boolean;
  hasUnresolvedTickets?: boolean;
  limit: number;
  offset: number;
}

interface GetLicencePlatesReturn {
  count: number;
  limit: number;
  offset: number;
  licencePlates: pts.LicencePlate[];
}


export const getLicencePlates = (queryOptions: GetLicencePlatesQueryOptions): GetLicencePlatesReturn => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  // build where clause

  const sqlParameters = [];

  let sqlInnerWhereClause = " where recordDelete_timeMillis is null";

  if (queryOptions.licencePlateNumber && queryOptions.licencePlateNumber !== "") {

    const filter = getSplitWhereClauseFilter("licencePlateNumber", queryOptions.licencePlateNumber);
    sqlInnerWhereClause += filter.sqlWhereClause;
    sqlParameters.push(...filter.sqlParams);
  }

  sqlParameters.push(...sqlParameters);

  // build having clause

  let sqlHavingClause = " having 1 = 1";

  if (Object.prototype.hasOwnProperty.call(queryOptions, "hasOwnerRecord")) {

    sqlHavingClause += queryOptions.hasOwnerRecord
      ? " and hasOwnerRecord = 1"
      : " and hasOwnerRecord = 0";
  }

  if (Object.prototype.hasOwnProperty.call(queryOptions, "hasUnresolvedTickets")) {

    sqlHavingClause += queryOptions.hasUnresolvedTickets
      ? " and unresolvedTicketCount > 0"
      : " and unresolvedTicketCount = 0";
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

  const count: number = database.prepare("select ifnull(count(*), 0) as cnt" +
    " from (" + innerSql + ")")
    .get(sqlParameters)
    .cnt;

  // do query

  const rows: pts.LicencePlate[] = database.prepare(innerSql +
    " order by licencePlateNumber, licencePlateProvince, licencePlateCountry" +
    " limit " + queryOptions.limit.toString() +
    " offset " + queryOptions.offset.toString())
    .all(sqlParameters);

  database.close();

  return {
    count,
    limit: queryOptions.limit,
    offset: queryOptions.offset,
    licencePlates: rows
  };

};


export default getLicencePlates;
