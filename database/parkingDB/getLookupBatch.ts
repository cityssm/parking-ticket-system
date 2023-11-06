// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/naming-convention */

import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type {
  LicencePlateLookupBatch,
  LicencePlateLookupBatchEntry
} from '../../types/recordTypes.js'

export interface LookupBatchReturn {
  success: boolean
  message?: string
  batch?: LicencePlateLookupBatch
}

export const getLookupBatch = (
  batchID_or_negOne: number
): LicencePlateLookupBatch | undefined => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const baseBatchSQL = `select batchID, batchDate, lockDate, sentDate, receivedDate, mto_includeLabels,
    recordCreate_userName, recordCreate_timeMillis,
    recordUpdate_userName, recordUpdate_timeMillis
    from LicencePlateLookupBatches
    where recordDelete_timeMillis is null`

  const batch =
    batchID_or_negOne === -1
      ? (database
          .prepare(
            baseBatchSQL +
              ' and lockDate is null' +
              ' order by batchID desc' +
              ' limit 1'
          )
          .get() as LicencePlateLookupBatch)
      : (database
          .prepare(baseBatchSQL + ' and batchID = ?')
          .get(batchID_or_negOne) as LicencePlateLookupBatch)

  if (!batch) {
    database.close()
    return undefined
  }

  batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate)
  batch.lockDateString = dateTimeFns.dateIntegerToString(
    batch.lockDate as number
  )
  batch.sentDateString = dateTimeFns.dateIntegerToString(
    batch.sentDate as number
  )
  batch.receivedDateString = dateTimeFns.dateIntegerToString(
    batch.receivedDate as number
  )

  batch.batchEntries = database
    .prepare(
      'select e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber,' +
        ' e.ticketID, t.ticketNumber, t.issueDate' +
        ' from LicencePlateLookupBatchEntries e' +
        ' left join ParkingTickets t on e.ticketID = t.ticketID' +
        ' where e.batchID = ?' +
        ' order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber'
    )
    .all(batch.batchID) as LicencePlateLookupBatchEntry[]

  database.close()

  return batch
}

export default getLookupBatch
