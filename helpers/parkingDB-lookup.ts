import { dbPath } from "./parkingDB";
import * as sqlite from "better-sqlite3";

import * as vehicleFns from "./vehicleFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import type * as pts from "./ptsTypes";


export function getLicencePlateLookupBatch(batchID_or_negOne: number) {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const baseBatchSQL = "select batchID, batchDate, lockDate, sentDate, receivedDate," +
    " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
    " from LicencePlateLookupBatches" +
    " where recordDelete_timeMillis is null";

  let batch: pts.LicencePlateLookupBatch;

  if (batchID_or_negOne === -1) {

    batch = db.prepare(baseBatchSQL +
      " and lockDate is null" +
      " order by batchID desc" +
      " limit 1")
      .get();

  } else {

    batch = db.prepare(baseBatchSQL +
      " and batchID = ?")
      .get(batchID_or_negOne);
  }

  if (!batch) {
    db.close();
    return null;
  }

  batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
  batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
  batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
  batch.receivedDateString = dateTimeFns.dateIntegerToString(batch.receivedDate);

  batch.batchEntries = db.prepare("select e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber," +
    " e.ticketID, t.ticketNumber, t.issueDate" +
    " from LicencePlateLookupBatchEntries e" +
    " left join ParkingTickets t on e.ticketID = t.ticketID" +
    " where e.batchID = ?" +
    " order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber")
    .all(batch.batchID);

  db.close();

  return batch;
}


interface AddLicencePlateToLookupBatchReturn {
  success: boolean;
  message?: string;
  batch?: pts.LicencePlateLookupBatch;
}

export function addLicencePlateToLookupBatch(reqBody: pts.LicencePlateLookupBatchEntry, reqSession: Express.Session): AddLicencePlateToLookupBatchReturn {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(reqSession.user.userName,
      Date.now(),
      reqBody.batchID).changes;

  if (canUpdateBatch === 0) {

    db.close();

    return {
      success: false,
      message: "Batch cannot be updated."
    };

  }

  const info = db.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
    " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
    " values (?, ?, ?, ?, ?)")
    .run(reqBody.batchID,
      reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber,
      reqBody.ticketID);

  db.close();

  if (info.changes > 0) {

    return {
      success: true
    };

  } else {

    return {
      success: false,
      message: "Licence plate not added to the batch.  It may be already part of the batch."
    };

  }

}


interface AddAllLicencePlatesToLookupBatchBody {
  batchID: number;
  licencePlateCountry: string;
  licencePlateProvince: string;
  licencePlateNumbers: [string, number][];
}

export function addAllLicencePlatesToLookupBatch(reqBody: AddAllLicencePlatesToLookupBatchBody, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(reqSession.user.userName,
      Date.now(),
      reqBody.batchID).changes;

  if (canUpdateBatch === 0) {

    db.close();

    return {
      success: false,
      message: "Batch cannot be updated."
    };

  }

  const insertStmt = db.prepare("insert or ignore into LicencePlateLookupBatchEntries" +
    " (batchID, licencePlateCountry, licencePlateProvince, licencePlateNumber, ticketID)" +
    " values (?, ?, ?, ?, ?)");

  let changeCount = 0;

  for (let index = 0; index < reqBody.licencePlateNumbers.length; index += 1) {

    const info = insertStmt
      .run(reqBody.batchID,
        reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumbers[index][0],
        reqBody.licencePlateNumbers[index][1]);

    changeCount += info.changes;
  }

  db.close();

  if (changeCount > 0) {

    return {
      success: true,
      batch: getLicencePlateLookupBatch(reqBody.batchID)
    };

  } else {

    return {
      success: false,
      message: "Licence plate not added to the batch.  It may be already part of the batch."
    };

  }

}


export function removeLicencePlateFromLookupBatch(reqBody: pts.LicencePlateLookupBatchEntry, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(reqSession.user.userName,
      Date.now(),
      reqBody.batchID).changes;

  if (canUpdateBatch === 0) {

    db.close();

    return {
      success: false,
      message: "Batch cannot be updated."
    };

  }

  const info = db.prepare("delete from LicencePlateLookupBatchEntries" +
    " where batchID = ?" +
    " and licencePlateCountry = ?" +
    " and licencePlateProvince = ?" +
    " and licencePlateNumber = ?")
    .run(reqBody.batchID,
      reqBody.licencePlateCountry, reqBody.licencePlateProvince, reqBody.licencePlateNumber);

  db.close();

  if (info.changes > 0) {

    return {
      success: true
    };

  } else {

    return {
      success: false,
      message: "Licence plate not removed from the batch."
    };

  }

}

interface LookupBatchReturn {
  success: boolean;
  message?: string;
  batch?: pts.LicencePlateLookupBatch;
}

export function clearLookupBatch(batchID: number, reqSession: Express.Session): LookupBatchReturn {

  const db = sqlite(dbPath);

  // Ensure batch is not locked

  const canUpdateBatch = db.prepare("update LicencePlateLookupBatches" +
    " set recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(reqSession.user.userName,
      Date.now(),
      batchID).changes;

  if (canUpdateBatch === 0) {

    db.close();

    return {
      success: false,
      message: "Batch cannot be updated."
    };

  }

  db.prepare("delete from LicencePlateLookupBatchEntries" +
    " where batchID = ?")
    .run(batchID);

  db.close();

  return {
    success: true
  };
}

export function lockLookupBatch(batchID: number, reqSession: Express.Session): LookupBatchReturn {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("update LicencePlateLookupBatches" +
    " set lockDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is null")
    .run(
      dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      batchID);

  if (info.changes > 0) {

    db.prepare("insert into ParkingTicketStatusLog" +
      " (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote," +
      " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +

      " select t.ticketID," +
      " ifnull(max(s.statusIndex), 0) + 1 as statusIndex," +
      " ? as statusDate," +
      " ? as statusTime," +
      " 'ownerLookupPending' as statusKey," +
      " e.batchID as statusField," +
      " 'Looking up '||e.licencePlateNumber||' '||e.licencePlateProvince||' '||e.licencePlateCountry as statusNote," +
      " ? as recordCreate_userName," +
      " ? as recordCreate_timeMillis," +
      " ? as recordUpdate_userName," +
      " ? as recordUpdate_timeMillis" +
      " from LicencePlateLookupBatchEntries e" +
      " left join ParkingTickets t" +
      " on e.licencePlateCountry = t.licencePlateCountry" +
      " and e.licencePlateProvince = t.licencePlateProvince" +
      " and e.licencePlateNumber = t.licencePlateNumber" +
      " left join ParkingTicketStatusLog s on t.ticketID = s.ticketID" +
      " where e.batchID = ?" +
      " and (e.ticketID = t.ticketID or (t.recordDelete_timeMillis is null and t.resolvedDate is null))" +
      " group by t.ticketID, e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber, e.batchID" +
      " having max(" +
      "case when s.statusKey in ('ownerLookupPending', 'ownerLookupMatch', 'ownerLookupError') and s.recordDelete_timeMillis is null then 1" +
      " else 0" +
      " end) = 0")
      .run(dateTimeFns.dateToInteger(rightNow),
        dateTimeFns.dateToTimeInteger(rightNow),
        reqSession.user.userName,
        rightNow.getTime(),
        reqSession.user.userName,
        rightNow.getTime(),
        batchID);

  }

  db.close();

  return {
    success: (info.changes > 0)
  };

}

export function markLookupBatchAsSent(batchID: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("update LicencePlateLookupBatches" +
    " set sentDate = ?," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where batchID = ?" +
    " and recordDelete_timeMillis is null" +
    " and lockDate is not null" +
    " and sentDate is null")
    .run(dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      batchID);

  db.close();

  return (info.changes > 0);
}

export function getUnreceivedLicencePlateLookupBatches(includeUnlocked: boolean) {

  const addCalculatedFieldsFn = function(batch: pts.LicencePlateLookupBatch) {
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate);
    batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate);
    batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate);
  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const batches: pts.LicencePlateLookupBatch[] = db.prepare(
    "select b.batchID, b.batchDate, b.lockDate, b.sentDate, count(e.batchID) as batchEntryCount" +
    " from LicencePlateLookupBatches b" +
    " left join LicencePlateLookupBatchEntries e on b.batchID = e.batchID" +
    " where b.recordDelete_timeMillis is null" +
    " and b.receivedDate is null" +
    (includeUnlocked ? "" : " and b.lockDate is not null") +
    " group by b.batchID, b.batchDate, b.lockDate, b.sentDate" +
    " order by b.batchID desc")
    .all();

  db.close();

  batches.forEach(addCalculatedFieldsFn);

  return batches;
}


export function createLicencePlateLookupBatch(reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const rightNow = new Date();

  const info = db.prepare("insert into LicencePlateLookupBatches" +
    " (batchDate, recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?)")
    .run(
      dateTimeFns.dateToInteger(rightNow),
      reqSession.user.userName,
      rightNow.getTime(),
      reqSession.user.userName,
      rightNow.getTime()
    );

  db.close();

  if (info.changes > 0) {

    return {
      success: true,
      batch: {
        batchID: info.lastInsertRowid,
        batchDate: dateTimeFns.dateToInteger(rightNow),
        batchDateString: dateTimeFns.dateToString(rightNow),
        lockDate: null,
        lockDateString: "",
        batchEntries: []
      }
    };

  } else {
    return { success: false };
  }
}

export interface ReconciliationRecord extends pts.LicencePlate {

  ticket_ticketID: number;
  ticket_ticketNumber: string;
  ticket_issueDate: number;
  ticket_issueDateString: string;
  ticket_vehicleMakeModel: string;

  ticket_licencePlateExpiryDate: number;
  ticket_licencePlateExpiryDateString: string;

  owner_recordDate: number;
  owner_recordDateString: string;

  owner_vehicleNCIC: string;
  owner_vehicleMake: string;
  owner_vehicleYear: number;
  owner_vehicleColor: string;

  owner_licencePlateExpiryDate: number;
  owner_licencePlateExpiryDateString: string;

  owner_ownerName1: string;
  owner_ownerName2: string;
  owner_ownerAddress: string;
  owner_ownerCity: string;
  owner_ownerProvince: string;
  owner_ownerPostalCode: string;

  dateDifference: number;

  isVehicleMakeMatch: boolean;
  isLicencePlateExpiryDateMatch: boolean;
}

export function getOwnershipReconciliationRecords() {

  const addCalculatedFieldsFn = function(record: ReconciliationRecord) {

    record.ticket_issueDateString = dateTimeFns.dateIntegerToString(record.ticket_issueDate);
    record.ticket_licencePlateExpiryDateString = dateTimeFns.dateIntegerToString(record.ticket_licencePlateExpiryDate);

    record.owner_recordDateString = dateTimeFns.dateIntegerToString(record.owner_recordDate);
    record.owner_licencePlateExpiryDateString = dateTimeFns.dateIntegerToString(record.owner_licencePlateExpiryDate);

    record.owner_vehicleMake = vehicleFns.getMakeFromNCIC(record.owner_vehicleNCIC);

    record.dateDifference = dateTimeFns.dateStringDifferenceInDays(record.ticket_issueDateString, record.owner_recordDateString);

    record.isVehicleMakeMatch = (record.ticket_vehicleMakeModel.toLowerCase() === record.owner_vehicleMake.toLowerCase()) ||
      (record.ticket_vehicleMakeModel.toLowerCase() === record.owner_vehicleNCIC.toLowerCase());

    record.isLicencePlateExpiryDateMatch = (record.ticket_licencePlateExpiryDate === record.owner_licencePlateExpiryDate);

  };

  const db = sqlite(dbPath, {
    readonly: true
  });

  const records: ReconciliationRecord[] = db.prepare(
    "select t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber," +

    " t.ticketID as ticket_ticketID," +
    " t.ticketNumber as ticket_ticketNumber," +
    " t.issueDate as ticket_issueDate," +
    " t.vehicleMakeModel as ticket_vehicleMakeModel," +
    " t.licencePlateExpiryDate as ticket_licencePlateExpiryDate," +

    " o.recordDate as owner_recordDate," +
    " o.vehicleNCIC as owner_vehicleNCIC," +
    " o.vehicleYear as owner_vehicleYear," +
    " o.vehicleColor as owner_vehicleColor," +
    " o.licencePlateExpiryDate as owner_licencePlateExpiryDate," +
    " o.ownerName1 as owner_ownerName1," +
    " o.ownerName2 as owner_ownerName2," +
    " o.ownerAddress as owner_ownerAddress," +
    " o.ownerCity as owner_ownerCity," +
    " o.ownerProvince as owner_ownerProvince," +
    " o.ownerPostalCode as owner_ownerPostalCode" +
    " from ParkingTickets t" +
    (" inner join LicencePlateOwners o" +
      " on t.licencePlateCountry = o.licencePlateCountry" +
      " and t.licencePlateProvince = o.licencePlateProvince" +
      " and t.licencePlateNumber = o.licencePlateNumber" +
      " and o.recordDelete_timeMillis is null" +
      " and o.vehicleNCIC <> ''" +
      (" and o.recordDate = (" +
        "select o2.recordDate from LicencePlateOwners o2" +
        " where t.licencePlateCountry = o2.licencePlateCountry" +
        " and t.licencePlateProvince = o2.licencePlateProvince" +
        " and t.licencePlateNumber = o2.licencePlateNumber" +
        " and o2.recordDelete_timeMillis is null" +
        " and t.issueDate <= o2.recordDate" +
        " order by o2.recordDate" +
        " limit 1)")) +
    " where t.recordDelete_timeMillis is null" +
    " and t.resolvedDate is null" +
    (" and not exists (" +
      "select 1 from ParkingTicketStatusLog s " +
      " where t.ticketID = s.ticketID " +
      " and s.statusKey in ('ownerLookupMatch', 'ownerLookupError')" +
      " and s.recordDelete_timeMillis is null)"))
    .all();

  db.close();

  records.forEach(addCalculatedFieldsFn);

  return records;
}

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

export function getUnacknowledgedLicencePlateLookupErrorLog(batchID_or_negOne: number, logIndex_or_negOne: number) {

  const addCalculatedFieldsFn = function(record: LookupErrorLogEntry) {
    record.recordDateString = dateTimeFns.dateIntegerToString(record.recordDate);
    record.issueDateString = dateTimeFns.dateIntegerToString(record.issueDate);
  };

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

  logEntries.forEach(addCalculatedFieldsFn);

  return logEntries;
}


export function markLicencePlateLookupErrorLogEntryAcknowledged(batchID: number, logIndex: number, reqSession: Express.Session) {

  const db = sqlite(dbPath);

  const info = db.prepare("update LicencePlateLookupErrorLog" +
    " set isAcknowledged = 1," +
    " recordUpdate_userName = ?," +
    " recordUpdate_timeMillis = ?" +
    " where recordDelete_timeMillis is null" +
    " and batchID = ?" +
    " and logIndex = ?" +
    " and isAcknowledged = 0")
    .run(reqSession.user.userName,
      Date.now(),
      batchID,
      logIndex);

  db.close();

  return info.changes > 0;
}
