import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

interface IsParkingTicketConvictedReturn {
  inBatch: boolean
  batchIDString?: string
}

export const isParkingTicketInConvictionBatchWithDB = (
  database: sqlite.Database,
  ticketID: number
): IsParkingTicketConvictedReturn => {
  const batchStatusCheck = database
    .prepare(
      `select statusField
        from ParkingTicketStatusLog
        where recordDelete_timeMillis is null
        and ticketID = ?
        and statusKey = 'convictionBatch'`
    )
    .get(ticketID) as { statusField: string } | undefined

  if (batchStatusCheck !== undefined) {
    return {
      inBatch: true,
      batchIDString: batchStatusCheck.statusField
    }
  }

  return {
    inBatch: false
  }
}

export const isParkingTicketInConvictionBatch = (
  ticketID: number
): IsParkingTicketConvictedReturn => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = isParkingTicketInConvictionBatchWithDB(database, ticketID)

  database.close()

  return result
}

export default isParkingTicketInConvictionBatch
