import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingLocation } from '../../types/recordTypes.js'

import type { AddUpdateParkingLocationReturn } from './getParkingLocations.js'

export default function addParkingLocation(
  requestBody: ParkingLocation
): AddUpdateParkingLocationReturn {
  const database = sqlite(databasePath)

  // Check if key is already used

  const locationRecord = database
    .prepare(
      `select locationName, isActive
        from ParkingLocations
        where locationKey = ?`
    )
    .get(requestBody.locationKey) as ParkingLocation | undefined

  if (locationRecord !== undefined) {
    database.close()

    return {
      success: false,
      message: `The location key "${
        requestBody.locationKey
      }" is already associated with the ${
        locationRecord.isActive ? '' : 'inactive '
      } record "${locationRecord.locationName}".`
    }
  }

  // Do insert

  const info = database
    .prepare(
      `insert into ParkingLocations (
        locationKey, locationName, locationClassKey, orderNumber, isActive)
        values (?, ?, ?, 0, 1)`
    )
    .run(
      requestBody.locationKey,
      requestBody.locationName,
      requestBody.locationClassKey
    )

  database.close()

  return {
    success: info.changes > 0
  }
}
