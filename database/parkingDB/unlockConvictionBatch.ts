import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export const unlockConvictionBatch = (
  batchId: number,
  sessionUser: PTSUser
): boolean => {
  const database = sqlite(databasePath)

  const rightNowMillis = Date.now()

  const info = database
    .prepare(
      `update ParkingTicketConvictionBatches
        set lockDate = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and batchId = ?
        and lockDate is not null
        and sentDate is null`
    )
    .run(sessionUser.userName, rightNowMillis, batchId)

  database.close()

  return info.changes > 0
}

export default unlockConvictionBatch
