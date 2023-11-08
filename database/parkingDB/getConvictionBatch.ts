import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type {
  ParkingTicketConvictionBatch,
  ParkingTicketStatusLog
} from '../../types/recordTypes.js'

export function getConvictionBatch(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  batchId_or_negOne: number
): ParkingTicketConvictionBatch | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const baseBatchSQL = `select batchId, batchDate, lockDate, sentDate,
    recordCreate_userName, recordCreate_timeMillis,
    recordUpdate_userName, recordUpdate_timeMillis
    from ParkingTicketConvictionBatches
    where recordDelete_timeMillis is null`

  const batch =
    batchId_or_negOne === -1
      ? (database
          .prepare(
            `${baseBatchSQL}
              and lockDate is null
              order by batchId desc
              limit 1`
          )
          .get() as ParkingTicketConvictionBatch)
      : (database
          .prepare(`${baseBatchSQL} and batchId = ?`)
          .get(batchId_or_negOne) as ParkingTicketConvictionBatch)

  if (batch === undefined) {
    database.close()
    return undefined
  }

  batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate)
  batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate)
  batch.sentDateString = dateTimeFns.dateIntegerToString(
    batch.sentDate as number
  )

  batch.batchEntries = database
    .prepare(
      `select s.statusIndex,
        s.statusDate, s.statusTime,
        t.ticketId, t.ticketNumber, t.issueDate,
        t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber,
        s.recordCreate_userName, s.recordCreate_timeMillis,
        s.recordUpdate_userName, s.recordUpdate_timeMillis
        from ParkingTicketStatusLog s
        left join ParkingTickets t on s.ticketId = t.ticketId
        where s.recordDelete_timeMillis is null
        and s.statusKey = 'convictionBatch'
        and s.statusField = ?
        order by t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber`
    )
    .all(batch.batchId.toString()) as ParkingTicketStatusLog[]

  for (const batchEntry of batch.batchEntries) {
    batchEntry.statusDateString = dateTimeFns.dateIntegerToString(
      batchEntry.statusDate as number
    )
    batchEntry.statusTimeString = dateTimeFns.timeIntegerToString(
      batchEntry.statusTime as number
    )
    batchEntry.issueDateString = dateTimeFns.dateIntegerToString(
      batchEntry.issueDate as number
    )
  }

  database.close()

  return batch
}

export default getConvictionBatch
