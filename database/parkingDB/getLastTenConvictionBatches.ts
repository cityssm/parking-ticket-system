import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicketConvictionBatch } from '../../types/recordTypes.js'

export const getLastTenConvictionBatches =
  (): ParkingTicketConvictionBatch[] => {
    const database = sqlite(databasePath, {
      readonly: true
    })

    const batches = database
      .prepare(
        `select batchID, batchDate, lockDate, sentDate,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis
          from ParkingTicketConvictionBatches
          where recordDelete_timeMillis is null
          order by batchID desc limit 10`
      )
      .all() as ParkingTicketConvictionBatch[]

    database.close()

    for (const batch of batches) {
      batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate)
      batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate)
      batch.sentDateString = dateTimeFns.dateIntegerToString(
        batch.sentDate as number
      )
    }

    return batches
  }

export default getLastTenConvictionBatches
