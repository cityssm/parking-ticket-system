import sqlite from 'better-sqlite3'

import type * as pts from '../../types/recordTypes'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export interface AddUpdateParkingOffenceReturn {
  success: boolean
  message?: string
  offences?: pts.ParkingOffence[]
}

export const getParkingOffences = (): pts.ParkingOffence[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database
    .prepare(
      'select o.bylawNumber, o.locationKey, o.parkingOffence,' +
        ' o.offenceAmount, o.discountOffenceAmount, o.discountDays, o.accountNumber' +
        ' from ParkingOffences o' +
        ' left join ParkingLocations l on o.locationKey = l.locationKey' +
        ' where o.isActive = 1 and l.isActive' +
        ' and o.bylawNumber in (select b.bylawNumber from ParkingBylaws b where b.isActive = 1)' +
        ' order by o.bylawNumber, l.locationName'
    )
    .all() as pts.ParkingOffence[]

  database.close()

  return rows
}

export const getParkingOffencesByLocationKey = (
  locationKey: string
): pts.ParkingOffence[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database
    .prepare(
      'select o.bylawNumber, b.bylawDescription,' +
        ' o.parkingOffence, o.offenceAmount, o.discountOffenceAmount, o.discountDays' +
        ' from ParkingOffences o' +
        ' left join ParkingBylaws b on o.bylawNumber = b.bylawNumber' +
        ' where o.isActive = 1 and b.isActive = 1' +
        ' and o.locationKey = ?' +
        ' order by b.orderNumber, b.bylawNumber'
    )
    .all(locationKey) as pts.ParkingOffence[]

  database.close()

  return rows
}

export default getParkingOffences