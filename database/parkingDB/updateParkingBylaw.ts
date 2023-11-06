import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type * as pts from '../../types/recordTypes.js'

import type { AddUpdateParkingBylawReturn } from './getParkingBylaws.js'

export const updateParkingBylaw = (
  requestBody: pts.ParkingBylaw
): AddUpdateParkingBylawReturn => {
  const database = sqlite(databasePath)

  // Do update

  const info = database
    .prepare(
      `update ParkingBylaws
        set bylawDescription = ?
        where bylawNumber = ?
        and isActive = 1`
    )
    .run(requestBody.bylawDescription, requestBody.bylawNumber)

  database.close()

  return {
    success: info.changes > 0
  }
}

export default updateParkingBylaw
