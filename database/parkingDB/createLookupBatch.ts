import { dateToInteger, dateToString } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { LicencePlateLookupBatch } from '../../types/recordTypes.js'

export interface CreateLookupBatchForm {
  mto_includeLabels?: '1' | '0'
}

export default function createLookupBatch(
  requestBody: CreateLookupBatchForm,
  sessionUser: PTSUser
): { success: boolean; batch?: LicencePlateLookupBatch } {
  const database = sqlite(databasePath)

  const rightNow = new Date()

  const info = database
    .prepare(
      `insert into LicencePlateLookupBatches (
        batchDate, mto_includeLabels,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      dateToInteger(rightNow),
      (requestBody.mto_includeLabels ?? '0') === '1' ? 1 : 0,
      sessionUser.userName,
      rightNow.getTime(),
      sessionUser.userName,
      rightNow.getTime()
    )

  database.close()

  return info.changes > 0
    ? {
        success: true,
        batch: {
          recordType: 'batch',
          batchId: info.lastInsertRowid as number,
          batchDate: dateToInteger(rightNow) as number,
          batchDateString: dateToString(rightNow),
          lockDate: undefined,
          lockDateString: '',
          batchEntries: []
        }
      }
    : { success: false }
}
