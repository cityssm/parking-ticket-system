import type sqlite from 'better-sqlite3'

import type { ParkingLocation } from '../../types/recordTypes.js'

export const getParkingLocationWithDB = (
  database: sqlite.Database,
  locationKey: string
): ParkingLocation => {
  return database
    .prepare(
      `select locationKey, locationName, locationClassKey, isActive
        from ParkingLocations
        where locationKey = ?`
    )
    .get(locationKey) as ParkingLocation
}
