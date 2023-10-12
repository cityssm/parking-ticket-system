import sqlite from 'better-sqlite3'

import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type * as pts from '../../types/recordTypes'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export interface LookupBatchReturn {
  success: boolean
  message?: string
  batch?: pts.LicencePlateLookupBatch
}

export const getLookupBatch = (
  batchID_or_negOne: number
): pts.LicencePlateLookupBatch => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const baseBatchSQL =
    'select batchID, batchDate, lockDate, sentDate, receivedDate, mto_includeLabels,' +
    ' recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis' +
    ' from LicencePlateLookupBatches' +
    ' where recordDelete_timeMillis is null'

  const batch =
    batchID_or_negOne === -1
      ? (database
          .prepare(
            baseBatchSQL +
              ' and lockDate is null' +
              ' order by batchID desc' +
              ' limit 1'
          )
          .get() as pts.LicencePlateLookupBatch)
      : (database
          .prepare(baseBatchSQL + ' and batchID = ?')
          .get(batchID_or_negOne) as pts.LicencePlateLookupBatch)

  if (!batch) {
    database.close()
    return undefined
  }

  batch.batchDateString = dateTimeFns.dateIntegerToString(batch.batchDate)
  batch.lockDateString = dateTimeFns.dateIntegerToString(batch.lockDate)
  batch.sentDateString = dateTimeFns.dateIntegerToString(batch.sentDate)
  batch.receivedDateString = dateTimeFns.dateIntegerToString(batch.receivedDate)

  batch.batchEntries = database
    .prepare(
      'select e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber,' +
        ' e.ticketID, t.ticketNumber, t.issueDate' +
        ' from LicencePlateLookupBatchEntries e' +
        ' left join ParkingTickets t on e.ticketID = t.ticketID' +
        ' where e.batchID = ?' +
        ' order by e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber'
    )
    .all(batch.batchID) as pts.LicencePlateLookupBatchEntry[]

  database.close()

  return batch
}

export default getLookupBatch
