import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingLocation } from '../../types/recordTypes.js'

export default function getParkingLocation(locationKey: string,
  connectedDatabase?: sqlite.Database): ParkingLocation {
  const database = connectedDatabase ?? sqlite(databasePath, { readonly: true })

  const location = database
    .prepare(
      `select locationKey, locationName, locationClassKey, isActive
        from ParkingLocations
        where locationKey = ?`
    )
    .get(locationKey) as ParkingLocation

  if (connectedDatabase === undefined) {
    database.close()
  }

  return location
}
