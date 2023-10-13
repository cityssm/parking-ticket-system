import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

import { isConvictionBatchUpdatableWithDB } from './isConvictionBatchUpdatable.js'

export const removeParkingTicketFromConvictionBatch = (
  batchID: number,
  ticketID: number,
  requestSession: expressSession.Session
): { success: boolean; message?: string } => {
  const database = sqlite(databasePath)

  // Ensure batch is not locked

  const batchIsAvailable = isConvictionBatchUpdatableWithDB(database, batchID)

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
        and ticketID = ?
        and statusKey in ('convicted', 'convictionBatch')
        and statusField = ?`
    )
    .run(
      requestSession.user.userName,
      rightNowMillis,
      ticketID,
      batchID.toString()
    )

  database.close()

  return {
    success: info.changes > 0
  }
}

export default removeParkingTicketFromConvictionBatch
