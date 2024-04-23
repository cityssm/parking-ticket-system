import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import { clearCacheByTableName } from '../../helpers/functions.cache.js'
import type { ParkingLocation } from '../../types/recordTypes.js'

import type { AddUpdateParkingLocationReturn } from './getParkingLocations.js'

export default function updateParkingLocation(
  requestBody: ParkingLocation
): AddUpdateParkingLocationReturn {
  const database = sqlite(databasePath)

  // Do update
  const info = database
    .prepare(
      `update ParkingLocations
        set locationName = ?,
        locationClassKey = ?
        where locationKey = ?
        and isActive = 1`
    )
    .run(
      requestBody.locationName,
      requestBody.locationClassKey,
      requestBody.locationKey
    )

  database.close()
  clearCacheByTableName('ParkingLocations')

  return {
    success: info.changes > 0
  }
}
