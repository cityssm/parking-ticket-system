// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/naming-convention */

import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { LicencePlate } from '../../types/recordTypes.js'

interface LookupErrorLogEntry extends LicencePlate {
  batchId: number
  logIndex: number
  recordDate: number
  recordDateString: string
  errorCode: string
  errorMessage: string
  ticketId: number
  ticketNumber: string
  issueDate: number
  issueDateString: string
  vehicleMakeModel: string
}

export default function getUnacknowledgedLookupErrorLog(
  batchId_or_negOne: number,
  logIndex_or_negOne: number
): LookupErrorLogEntry[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  let parameters: unknown[] = []

  if (batchId_or_negOne !== -1 && logIndex_or_negOne !== -1) {
    parameters = [batchId_or_negOne, logIndex_or_negOne]
  }

  const logEntries = database
    .prepare(
      `select l.batchId, l.logIndex,
        l.licencePlateCountry, l.licencePlateProvince, l.licencePlateNumber,
        l.recordDate, l.errorCode, l.errorMessage,
        e.ticketId, t.ticketNumber, t.issueDate, t.vehicleMakeModel
        from LicencePlateLookupErrorLog l
        inner join LicencePlateLookupBatches b
          on l.batchId = b.batchId
          and b.recordDelete_timeMillis is null
        inner join LicencePlateLookupBatchEntries e
          on b.batchId = e.batchId
          and l.licencePlateCountry = e.licencePlateCountry
          and l.licencePlateProvince = e.licencePlateProvince
          and l.licencePlateNumber = e.licencePlateNumber
        inner join ParkingTickets t
          on e.ticketId = t.ticketId
          and e.licencePlateCountry = t.licencePlateCountry
          and e.licencePlateProvince = t.licencePlateProvince
          and e.licencePlateNumber = t.licencePlateNumber
          and t.recordDelete_timeMillis is null
          and t.resolvedDate is null
        where l.recordDelete_timeMillis is null
        and l.isAcknowledged = 0
        ${parameters.length > 0 ? ' and l.batchId = ? and l.logIndex = ?' : ''}`
    )
    .all(parameters) as LookupErrorLogEntry[]

  database.close()

  for (const logEntry of logEntries) {
    logEntry.recordDateString = dateTimeFns.dateIntegerToString(
      logEntry.recordDate
    )
    logEntry.issueDateString = dateTimeFns.dateIntegerToString(
      logEntry.issueDate
    )
  }

  return logEntries
}
