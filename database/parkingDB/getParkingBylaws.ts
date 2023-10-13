import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingBylaw } from '../../types/recordTypes.js'

export interface AddUpdateParkingBylawReturn {
  success: boolean
  message?: string
  bylaws?: ParkingBylaw[]
}

export const getParkingBylaws = (): ParkingBylaw[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database
    .prepare(
      `select bylawNumber, bylawDescription
        from ParkingBylaws
        where isActive = 1
        order by orderNumber, bylawNumber`
    )
    .all() as ParkingBylaw[]

  database.close()

  return rows
}

export const getParkingBylawsWithOffenceStats = (): ParkingBylaw[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database
    .prepare(
      `select b.bylawNumber, b.bylawDescription,
        count(o.locationKey) as offenceCount,
        min(o.offenceAmount) as offenceAmountMin,
        max(o.offenceAmount) as offenceAmountMax,
        min(o.discountOffenceAmount) as discountOffenceAmountMin,
        max(o.discountOffenceAmount) as discountOffenceAmountMax,
        min(o.discountDays) as discountDaysMin,
        max(o.discountDays) as discountDaysMax
        from ParkingBylaws b
        left join ParkingOffences o on b.bylawNumber = o.bylawNumber and o.isActive = 1
        where b.isActive = 1
        group by b.bylawNumber, b.bylawDescription, b.orderNumber
        order by b.orderNumber, b.bylawNumber`
    )
    .all() as ParkingBylaw[]

  database.close()

  return rows
}

export default getParkingBylaws
