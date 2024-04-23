import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import { clearCacheByTableName } from '../../helpers/functions.cache.js'

import type { AddUpdateParkingBylawReturn } from './getParkingBylaws.js'

export default function deleteParkingBylaw(
  bylawNumber: string
): AddUpdateParkingBylawReturn {
  const database = sqlite(databasePath)

  // Do update
  const info = database
    .prepare(
      `update ParkingBylaws
        set isActive = 0
        where bylawNumber = ?
        and isActive = 1`
    )
    .run(bylawNumber)

  database.close()
  clearCacheByTableName('ParkingBylaws')

  return {
    success: info.changes > 0
  }
}
