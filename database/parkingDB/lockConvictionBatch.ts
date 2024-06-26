import { dateIntegerToString, dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

interface LockConvictionBatchReturn {
  success: boolean
  lockDate: number
  lockDateString: string
}

export default function lockConvictionBatch(
  batchId: number,
  sessionUser: PTSUser
): LockConvictionBatchReturn {
  const database = sqlite(databasePath)

  const rightNow = new Date()

  const lockDate = dateToInteger(rightNow) as number

  const info = database
    .prepare(
      `update ParkingTicketConvictionBatches
        set lockDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and batchId = ?
        and lockDate is null`
    )
    .run(lockDate, sessionUser.userName, rightNow.getTime(), batchId)

  database.close()

  return {
    success: info.changes > 0,
    lockDate,
    lockDateString: dateIntegerToString(lockDate)
  }
}
