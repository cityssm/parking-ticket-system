import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { LicencePlateLookupBatch } from '../../types/recordTypes.js'

export const createConvictionBatch = (
  requestSession: expressSession.Session
): { success: boolean; batch?: LicencePlateLookupBatch } => {
  const database = sqlite(databasePath)

  const rightNow = new Date()

  const info = database
    .prepare(
      `insert into ParkingTicketConvictionBatches (
        batchDate, recordCreate_userName,
        recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?)`
    )
    .run(
      dateTimeFns.dateToInteger(rightNow),
      requestSession.user.userName,
      rightNow.getTime(),
      requestSession.user.userName,
      rightNow.getTime()
    )

  database.close()

  return info.changes > 0
    ? {
        success: true,
        batch: {
          recordType: 'batch',
          batchID: info.lastInsertRowid as number,
          batchDate: dateTimeFns.dateToInteger(rightNow),
          batchDateString: dateTimeFns.dateToString(rightNow),
          lockDate: undefined,
          lockDateString: '',
          batchEntries: []
        }
      }
    : { success: false }
}

export default createConvictionBatch
