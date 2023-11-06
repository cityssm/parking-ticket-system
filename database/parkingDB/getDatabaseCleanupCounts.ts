import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import * as configFunctions from '../../helpers/functions.config.js'

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

export function getDatabaseCleanupCounts(): GetDatabaseCleanupCountsReturn {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const recordDelete_timeMillisWindow =
    Date.now() -
    configFunctions.getProperty('databaseCleanup.windowDays') * 86_400 * 1000

  const database = sqlite(databasePath, {
    readonly: true
  })

  // Tickets
  const parkingTickets: number = database
    .prepare(
      `select count(*) as cnt
          from ParkingTickets t
          where t.recordDelete_timeMillis is not null
          and t.recordDelete_timeMillis < ?
          and not exists (select 1 from LicencePlateLookupBatchEntries b where t.ticketID = b.ticketID)`
    )
    .pluck()
    .get(recordDelete_timeMillisWindow) as number

  // Status Log
  const parkingTicketStatusLog = database
    .prepare(
      `select count(*) as cnt
        from ParkingTicketStatusLog
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`
    )
    .pluck()
    .get(recordDelete_timeMillisWindow) as number

  // Remarks
  const parkingTicketRemarks = database
    .prepare(
      `select count(*) as cnt
        from ParkingTicketRemarks
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`
    )
    .pluck()
    .get(recordDelete_timeMillisWindow) as number

  // Licence Plate Owners
  const licencePlateOwners = database
    .prepare(
      `select count(*) as cnt
        from LicencePlateOwners
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`
    )
    .pluck()
    .get(recordDelete_timeMillisWindow) as number

  // Parking Locations
  const parkingLocations = database
    .prepare(
      `select count(*) as cnt
        from ParkingLocations l
        where isActive = 0
        and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)
        and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)`
    )
    .pluck()
    .get() as number

  // Parking By-Laws
  const parkingBylaws = database
    .prepare(
      `select count(*) as cnt
        from ParkingBylaws b
        where isActive = 0
        and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)
        and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)`
    )
    .pluck()
    .get() as number

  // Parking Offences
  const parkingOffences = database
    .prepare(
      `select count(*) as cnt
        from ParkingOffences o
        where isActive = 0
        and not exists (select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)`
    )
    .pluck()
    .get() as number

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
