import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type * as pts from '../../types/recordTypes.js'

import type { AddUpdateParkingLocationReturn } from './getParkingLocations.js'

export const updateParkingLocation = (
  requestBody: pts.ParkingLocation
): AddUpdateParkingLocationReturn => {
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

  return {
    success: info.changes > 0
  }
}

export default updateParkingLocation
