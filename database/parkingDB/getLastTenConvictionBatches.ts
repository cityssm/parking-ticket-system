import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketConvictionBatch } from '../../types/recordTypes.js'

export default function getLastTenConvictionBatches(): ParkingTicketConvictionBatch[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const batches = database
    .prepare(
      `select batchId, batchDate, lockDate, sentDate,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis
        from ParkingTicketConvictionBatches
        where recordDelete_timeMillis is null
        order by batchId desc
        limit 10`
    )
    .all() as ParkingTicketConvictionBatch[]

  database.close()

  for (const batch of batches) {
    batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate)

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    batch.lockDateString = dateTimeFns.isValidDateInteger(batch.lockDate)
      ? dateTimeFns.dateIntegerToString(batch.lockDate)
      : ''

    batch.sentDateString = dateTimeFns.dateIntegerToString(
      batch.sentDate as number
    )
  }

  return batches
}
