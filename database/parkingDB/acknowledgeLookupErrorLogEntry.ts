import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export default function acknowledgeLookupErrorLogEntry(
  batchId: number,
  logIndex: number,
  sessionUser: PTSUser
): boolean {
  const database = sqlite(databasePath)

  const info = database
    .prepare(
      `update LicencePlateLookupErrorLog
        set isAcknowledged = 1,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and batchId = ?
        and logIndex = ?
        and isAcknowledged = 0`
    )
    .run(sessionUser.userName, Date.now(), batchId, logIndex)

  database.close()

  return info.changes > 0
}
