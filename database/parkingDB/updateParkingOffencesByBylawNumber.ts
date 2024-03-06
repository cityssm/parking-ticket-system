import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingBylaw } from '../../types/recordTypes.js'

export interface UpdateParkingOffencesByBylawNumberForm {
  bylawNumber: string
  offenceAmount: string
  discountDays: string
  discountOffenceAmount: string
}

export default function updateParkingOffencesByBylawNumber(
  requestBody: UpdateParkingOffencesByBylawNumberForm
): { success: boolean; bylaws?: ParkingBylaw[] } {
  const database = sqlite(databasePath)

  // Do update
  const info = database
    .prepare(
      `update ParkingOffences
        set offenceAmount = ?,
        discountOffenceAmount = ?,
        discountDays = ?
        where bylawNumber = ?
        and isActive = 1`
    )
    .run(
      requestBody.offenceAmount,
      requestBody.discountOffenceAmount,
      requestBody.discountDays,
      requestBody.bylawNumber
    )

  database.close()

  return {
    success: info.changes > 0
  }
}
