import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

import { isConvictionBatchUpdatable } from './isConvictionBatchUpdatable.js'

export default function removeParkingTicketFromConvictionBatch(
  batchId: number,
  ticketId: number,
  sessionUser: PTSUser
): { success: boolean; message?: string } {
  const database = sqlite(databasePath)

  // Ensure batch is not locked
  const batchIsAvailable = isConvictionBatchUpdatable(batchId, database)

  if (!batchIsAvailable) {
    database.close()

    return {
      success: false,
      message: 'The batch cannot be updated.'
    }
  }

  // Update statuses
  const rightNowMillis = Date.now()

  const info = database
    .prepare(
      `update ParkingTicketStatusLog
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and ticketId = ?
        and statusKey in ('convicted', 'convictionBatch')
        and statusField = ?`
    )
    .run(sessionUser.userName, rightNowMillis, ticketId, batchId.toString())

  database.close()

  return {
    success: info.changes > 0
  }
}
