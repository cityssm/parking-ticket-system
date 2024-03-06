import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export default function cleanupParkingTicketRemarksTable(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  recordDelete_timeMillis: number
): boolean {
  const database = sqlite(databasePath)

  database
    .prepare(
      `delete from ParkingTicketRemarks
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`
    )
    .run(recordDelete_timeMillis)

  database.close()

  return true
}
