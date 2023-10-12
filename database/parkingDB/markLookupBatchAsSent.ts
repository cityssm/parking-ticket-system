import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export const markLookupBatchAsSent = (
  batchID: number,
  requestSession: expressSession.Session
): boolean => {
  const database = sqlite(databasePath)

  const rightNow = new Date()

  const info = database
    .prepare(
      `update LicencePlateLookupBatches
        set sentDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchID = ?
        and recordDelete_timeMillis is null
        and lockDate is not null
        and sentDate is null`
    )
    .run(
      dateTimeFns.dateToInteger(rightNow),
      requestSession.user.userName,
      rightNow.getTime(),
      batchID
    )

  database.close()

  return info.changes > 0
}

export default markLookupBatchAsSent
