import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingOffence } from '../../types/recordTypes.js'

import type { AddUpdateParkingOffenceReturn } from './getParkingOffences.js'

export default function updateParkingOffence(requestBody: ParkingOffence): AddUpdateParkingOffenceReturn {
  const database = sqlite(databasePath)

  // Do update
  const info = database
    .prepare(
      `update ParkingOffences
        set parkingOffence = ?,
        offenceAmount = ?,
        discountOffenceAmount = ?,
        discountDays = ?,
        accountNumber = ?
        where bylawNumber = ?
        and locationKey = ?
        and isActive = 1`
    )
    .run(
      requestBody.parkingOffence,
      requestBody.offenceAmount,
      requestBody.discountOffenceAmount,
      requestBody.discountDays,
      requestBody.accountNumber,
      requestBody.bylawNumber,
      requestBody.locationKey
    )

  database.close()

  return {
    success: info.changes > 0
  }
}
