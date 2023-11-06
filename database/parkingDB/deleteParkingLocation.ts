import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

import type { AddUpdateParkingLocationReturn } from './getParkingLocations.js'

export function deleteParkingLocation(
  locationKey: string
): AddUpdateParkingLocationReturn {
  const database = sqlite(databasePath)

  // Do update
  const info = database
    .prepare(
      `update ParkingLocations
        set isActive = 0
        where locationKey = ?
        and isActive = 1`
    )
    .run(locationKey)

  database.close()

  return {
    success: info.changes > 0
  }
}

export default deleteParkingLocation
