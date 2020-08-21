import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "../ptsTypes";

import { parkingDB as dbPath } from "../../data/databasePaths";


interface LookupErrorLogEntry extends pts.LicencePlate {
  batchID: number;
  logIndex: number;
  recordDate: number;
  recordDateString: string;
  errorCode: string;
  errorMessage: string;
  ticketID: number;
  ticketNumber: string;
  issueDate: number;
  issueDateString: string;
  vehicleMakeModel: string;
}


export const getUnacknowledgedLookupErrorLog =
  (batchID_or_negOne: number, logIndex_or_negOne: number) => {

    const db = sqlite(dbPath, {
      readonly: true
    });

    let params = [];

    if (batchID_or_negOne !== -1 && logIndex_or_negOne !== -1) {
      params = [batchID_or_negOne, logIndex_or_negOne];
    }

    const logEntries: LookupErrorLogEntry[] = db.prepare("select l.batchID, l.logIndex," +
      " l.licencePlateCountry, l.licencePlateProvince, l.licencePlateNumber, l.recordDate," +
      " l.errorCode, l.errorMessage," +
      " e.ticketID, t.ticketNumber, t.issueDate, t.vehicleMakeModel" +
      " from LicencePlateLookupErrorLog l" +
      (" inner join LicencePlateLookupBatches b" +
        " on l.batchID = b.batchID" +
        " and b.recordDelete_timeMillis is null") +
      (" inner join LicencePlateLookupBatchEntries e" +
        " on b.batchID = e.batchID" +
        " and l.licencePlateCountry = e.licencePlateCountry" +
        " and l.licencePlateProvince = e.licencePlateProvince" +
        " and l.licencePlateNumber = e.licencePlateNumber") +
      (" inner join ParkingTickets t" +
        " on e.ticketID = t.ticketID" +
        " and e.licencePlateCountry = t.licencePlateCountry" +
        " and e.licencePlateProvince = t.licencePlateProvince" +
        " and e.licencePlateNumber = t.licencePlateNumber" +
        " and t.recordDelete_timeMillis is null" +
        " and t.resolvedDate is null") +
      " where l.recordDelete_timeMillis is null" +
      " and l.isAcknowledged = 0" +
      (params.length > 0 ? " and l.batchID = ? and l.logIndex = ?" : "")
    )
      .all(params);

    db.close();

    for (const logEntry of logEntries) {
      logEntry.recordDateString = dateTimeFns.dateIntegerToString(logEntry.recordDate);
      logEntry.issueDateString = dateTimeFns.dateIntegerToString(logEntry.issueDate);
    }

    return logEntries;
  };
