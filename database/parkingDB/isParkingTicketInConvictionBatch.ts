import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

interface IsParkingTicketConvictedReturn {
  inBatch: boolean
  batchIdString?: string
}

export function isParkingTicketInConvictionBatchWithDB(
  database: sqlite.Database,
  ticketId: number
): IsParkingTicketConvictedReturn {
  const batchStatusCheck = database
    .prepare(
      `select statusField
        from ParkingTicketStatusLog
        where recordDelete_timeMillis is null
        and ticketId = ?
        and statusKey = 'convictionBatch'`
    )
    .get(ticketId) as { statusField: string } | undefined

  if (batchStatusCheck !== undefined) {
    return {
      inBatch: true,
      batchIdString: batchStatusCheck.statusField
    }
  }

  return {
    inBatch: false
  }
}

export default function isParkingTicketInConvictionBatch(
  ticketId: number
): IsParkingTicketConvictedReturn {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = isParkingTicketInConvictionBatchWithDB(database, ticketId)

  database.close()

  return result
}
