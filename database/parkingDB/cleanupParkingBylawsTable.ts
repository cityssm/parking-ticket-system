import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export const cleanupParkingBylawsTable = (): boolean => {
  const database = sqlite(databasePath)

  const recordsToDelete = database
    .prepare(
      'select bylawNumber from ParkingBylaws b' +
        ' where isActive = 0' +
        ' and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)' +
        ' and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)'
    )
    .all() as Array<{ bylawNumber: string }>

  for (const recordToDelete of recordsToDelete) {
    database
      .prepare(
        'delete from ParkingBylaws' +
          ' where bylawNumber = ?' +
          ' and isActive = 0'
      )
      .run(recordToDelete.bylawNumber)
  }

  database.close()

  return true
}

export default cleanupParkingBylawsTable
