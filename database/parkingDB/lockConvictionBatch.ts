import { dateIntegerToString, dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

interface LockConvictionBatchReturn {
  success: boolean
  lockDate: number
  lockDateString: string
}

export const lockConvictionBatch = (
  batchID: number,
  sessionUser: PTSUser
): LockConvictionBatchReturn => {
  const database = sqlite(databasePath)

  const rightNow = new Date()

  const lockDate = dateToInteger(rightNow)

  const info = database
    .prepare(
      `update ParkingTicketConvictionBatches
        set lockDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and batchID = ?
        and lockDate is null`
    )
    .run(lockDate, sessionUser.userName, rightNow.getTime(), batchID)

  database.close()

  return {
    success: info.changes > 0,
    lockDate,
    lockDateString: dateIntegerToString(lockDate)
  }
}

export default lockConvictionBatch
