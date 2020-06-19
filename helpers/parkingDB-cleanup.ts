import { dbPath } from "./parkingDB";
import * as sqlite from "better-sqlite3";

import * as configFns from "./configFns";


export function getDatabaseCleanupCounts() {

  const recordDelete_timeMillisWindow = Date.now() - (configFns.getProperty("databaseCleanup.windowDays") * 86400 * 1000);

  const db = sqlite(dbPath, {
    readonly: true
  });

  // Tickets

  const parkingTickets = db.prepare("select count(*) as cnt from ParkingTickets t" +
    " where t.recordDelete_timeMillis is not null" +
    " and t.recordDelete_timeMillis < ?" +
    (" and not exists (" +
      "select 1 from LicencePlateLookupBatchEntries b" +
      " where t.ticketID = b.ticketID)"))
    .get(recordDelete_timeMillisWindow).cnt;

  // Status Log

  const parkingTicketStatusLog = db.prepare("select count(*) as cnt from ParkingTicketStatusLog" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .get(recordDelete_timeMillisWindow).cnt;

  // Remarks

  const parkingTicketRemarks = db.prepare("select count(*) as cnt from ParkingTicketRemarks" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .get(recordDelete_timeMillisWindow).cnt;

  // Licence Plate Owners

  const licencePlateOwners = db.prepare("select count(*) as cnt from LicencePlateOwners" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .get(recordDelete_timeMillisWindow).cnt;

  // Parking Locations

  const parkingLocations = db.prepare("select count(*) as cnt from ParkingLocations l" +
    " where isActive = 0" +
    " and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)" +
    " and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)")
    .get().cnt;

  // Parking By-Laws

  const parkingBylaws = db.prepare("select count(*) as cnt from ParkingBylaws b" +
    " where isActive = 0" +
    " and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)" +
    " and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)")
    .get().cnt;

  // Parking Offences

  const parkingOffences = db.prepare("select count(*) as cnt from ParkingOffences o" +
    " where isActive = 0" +
    " and not exists (select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)")
    .get().cnt;

  // Licence Plate Lookup Error Log

  /*
  const licencePlateLookupErrorLog = db.prepare("select count(*) as cnt from LicencePlateLookupErrorLog" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .get(recordDelete_timeMillisWindow).cnt;
  */

  // Conviction Batches

  /*
  const parkingTicketConvictionBatches = db.prepare("select count(*) as cnt from ParkingTicketConvictionBatches" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .get(recordDelete_timeMillisWindow).cnt;
  */

  // Licence Plate Lookup Batches

  /*
  const licencePlateLookupBatches = db.prepare("select count(*) as cnt from LicencePlateLookupBatches" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .get(recordDelete_timeMillisWindow).cnt;
  */

  db.close();

  return {
    recordDelete_timeMillis: recordDelete_timeMillisWindow,

    parkingTickets,
    parkingTicketStatusLog,
    parkingTicketRemarks,
    licencePlateOwners,

    parkingLocations,
    parkingBylaws,
    parkingOffences

    //licencePlateLookupErrorLog: licencePlateLookupErrorLog
    //parkingTicketConvictionBatches: parkingTicketConvictionBatches,
    //licencePlateLookupBatches: licencePlateLookupBatches,
  };
}


export function cleanupParkingTicketsTable(recordDelete_timeMillis: number) {

  const db = sqlite(dbPath);

  const recordsToDelete = db.prepare("select ticketID from ParkingTickets t" +
    " where t.recordDelete_timeMillis is not null" +
    " and t.recordDelete_timeMillis < ?" +
    (" and not exists (" +
      "select 1 from LicencePlateLookupBatchEntries b" +
      " where t.ticketID = b.ticketID)"))
    .all(recordDelete_timeMillis);

  recordsToDelete.forEach(function(recordToDelete) {

    db.prepare("delete from ParkingTicketRemarks" +
      " where ticketID = ?")
      .run(recordToDelete.ticketID);

    db.prepare("delete from ParkingTicketStatusLog" +
      " where ticketID = ?")
      .run(recordToDelete.ticketID);

    db.prepare("delete from ParkingTickets" +
      " where ticketID = ?")
      .run(recordToDelete.ticketID);
  });

  db.close();

  return true;

}

export function cleanupParkingTicketRemarksTable(recordDelete_timeMillis: number) {

  const db = sqlite(dbPath);

  db.prepare("delete from ParkingTicketRemarks" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .run(recordDelete_timeMillis);

  db.close();

  return true;

}

export function cleanupParkingTicketStatusLog(recordDelete_timeMillis: number) {

  const db = sqlite(dbPath);

  db.prepare("delete from ParkingTicketStatusLog" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .run(recordDelete_timeMillis);

  db.close();

  return true;

}

export function cleanupLicencePlateOwnersTable(recordDelete_timeMillis: number) {

  const db = sqlite(dbPath);

  db.prepare("delete from LicencePlateOwners" +
    " where recordDelete_timeMillis is not null" +
    " and recordDelete_timeMillis < ?")
    .run(recordDelete_timeMillis);

  db.close();

  return true;

}

export function cleanupParkingOffencesTable() {

  const db = sqlite(dbPath);

  const recordsToDelete = db.prepare("select o.bylawNumber, o.locationKey" +
    " from ParkingOffences o" +
    " where isActive = 0" +
    " and not exists (select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)")
    .all();

  for (let recordIndex = 0; recordIndex < recordsToDelete.length; recordIndex += 1) {

    db.prepare("delete from ParkingOffences" +
      " where bylawNumber = ?" +
      " and locationKey = ?" +
      " and isActive = 0")
      .run(recordsToDelete[recordIndex].bylawNumber,
        recordsToDelete[recordIndex].locationKey);
  }

  db.close();

  return true;

}

export function cleanupParkingLocationsTable() {

  const db = sqlite(dbPath);

  const recordsToDelete = db.prepare("select locationKey from ParkingLocations l" +
    " where isActive = 0" +
    " and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)" +
    " and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)")
    .all();

  for (let recordIndex = 0; recordIndex < recordsToDelete.length; recordIndex += 1) {

    db.prepare("delete from ParkingLocations" +
      " where locationKey = ?" +
      " and isActive = 0")
      .run(recordsToDelete[recordIndex].locationKey);
  }

  db.close();

  return true;

}

export function cleanupParkingBylawsTable() {

  const db = sqlite(dbPath);

  const recordsToDelete = db.prepare("select bylawNumber from ParkingBylaws b" +
    " where isActive = 0" +
    " and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)" +
    " and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)")
    .all();

  for (let recordIndex = 0; recordIndex < recordsToDelete.length; recordIndex += 1) {

    db.prepare("delete from ParkingBylaws" +
      " where bylawNumber = ?" +
      " and isActive = 0")
      .run(recordsToDelete[recordIndex].bylawNumber);
  }

  db.close();

  return true;
}
