import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingLocation } from '../../types/recordTypes.js'

export interface AddUpdateParkingLocationReturn {
  success: boolean
  message?: string
  locations?: ParkingLocation[]
}

export const getParkingLocations = (): ParkingLocation[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database
    .prepare(
      `select locationKey, locationName, locationClassKey
        from ParkingLocations
        where isActive = 1
        order by orderNumber, locationName`
    )
    .all() as ParkingLocation[]

  database.close()

  return rows
}

export default getParkingLocations
