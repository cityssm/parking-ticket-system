import sqlite from 'better-sqlite3'

import * as configFunctions from '../../helpers/functions.config.js'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

interface GetDatabaseCleanupCountsReturn {
  recordDelete_timeMillis: number

  parkingTickets: number
  parkingTicketStatusLog: number
  parkingTicketRemarks: number
  licencePlateOwners: number

  parkingLocations: number
  parkingBylaws: number
  parkingOffences: number
}

export const getDatabaseCleanupCounts = (): GetDatabaseCleanupCountsReturn => {
  const recordDelete_timeMillisWindow =
    Date.now() -
    configFunctions.getProperty('databaseCleanup.windowDays') * 86_400 * 1000

  const database = sqlite(databasePath, {
    readonly: true
  })

  // Tickets

  const parkingTickets: number = (
    database
      .prepare(
        'select count(*) as cnt from ParkingTickets t' +
          ' where t.recordDelete_timeMillis is not null' +
          ' and t.recordDelete_timeMillis < ?' +
          (' and not exists (' +
            'select 1 from LicencePlateLookupBatchEntries b' +
            ' where t.ticketID = b.ticketID)')
      )
      .get(recordDelete_timeMillisWindow) as { cnt: number }
  ).cnt

  // Status Log

  const parkingTicketStatusLog: number = (
    database
      .prepare(
        'select count(*) as cnt from ParkingTicketStatusLog' +
          ' where recordDelete_timeMillis is not null' +
          ' and recordDelete_timeMillis < ?'
      )
      .get(recordDelete_timeMillisWindow) as { cnt: number }
  ).cnt

  // Remarks

  const parkingTicketRemarks: number = (
    database
      .prepare(
        'select count(*) as cnt from ParkingTicketRemarks' +
          ' where recordDelete_timeMillis is not null' +
          ' and recordDelete_timeMillis < ?'
      )
      .get(recordDelete_timeMillisWindow) as { cnt: number }
  ).cnt

  // Licence Plate Owners

  const licencePlateOwners: number = (
    database
      .prepare(
        'select count(*) as cnt from LicencePlateOwners' +
          ' where recordDelete_timeMillis is not null' +
          ' and recordDelete_timeMillis < ?'
      )
      .get(recordDelete_timeMillisWindow) as { cnt: number }
  ).cnt

  // Parking Locations

  const parkingLocations: number = (
    database
      .prepare(
        'select count(*) as cnt from ParkingLocations l' +
          ' where isActive = 0' +
          ' and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)' +
          ' and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)'
      )
      .get() as { cnt: number }
  ).cnt

  // Parking By-Laws

  const parkingBylaws: number = (
    database
      .prepare(
        'select count(*) as cnt from ParkingBylaws b' +
          ' where isActive = 0' +
          ' and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)' +
          ' and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)'
      )
      .get() as { cnt: number }
  ).cnt

  // Parking Offences

  const parkingOffences: number = (
    database
      .prepare(
        'select count(*) as cnt from ParkingOffences o' +
          ' where isActive = 0' +
          (' and not exists (' +
            'select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)')
      )
      .get() as { cnt: number }
  ).cnt

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

  database.close()

  return {
    recordDelete_timeMillis: recordDelete_timeMillisWindow,

    parkingTickets,
    parkingTicketStatusLog,
    parkingTicketRemarks,
    licencePlateOwners,

    parkingLocations,
    parkingBylaws,
    parkingOffences

    // licencePlateLookupErrorLog: licencePlateLookupErrorLog
    // parkingTicketConvictionBatches: parkingTicketConvictionBatches,
    // licencePlateLookupBatches: licencePlateLookupBatches,
  }
}

export default getDatabaseCleanupCounts
