import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { LicencePlateLookupBatch } from '../../types/recordTypes.js'

export function getUnreceivedLookupBatches(
  includeUnlocked: boolean
): LicencePlateLookupBatch[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const batches = database
    .prepare(
      `select b.batchID, b.batchDate, b.lockDate, b.sentDate, b.mto_includeLabels,
        count(e.batchID) as batchEntryCount
        from LicencePlateLookupBatches b
        left join LicencePlateLookupBatchEntries e on b.batchID = e.batchID
        where b.recordDelete_timeMillis is null
        and b.receivedDate is null
        ${includeUnlocked ? '' : ' and b.lockDate is not null'}
        group by b.batchID, b.batchDate, b.lockDate, b.sentDate, b.mto_includeLabels
        order by b.batchID desc`
    )
    .all() as LicencePlateLookupBatch[]

  database.close()

  for (const batch of batches) {
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate)
    batch.lockDateString = dateTimeFns.dateIntegerToString(
      batch.lockDate as number
    )
    batch.sentDateString = dateTimeFns.dateIntegerToString(
      batch.sentDate as number
    )
  }

  return batches
}

export default getUnreceivedLookupBatches
