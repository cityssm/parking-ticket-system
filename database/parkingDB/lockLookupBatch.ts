import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

import type { LookupBatchReturn } from './getLookupBatch.js'

export function lockLookupBatch(
  batchId: number,
  sessionUser: PTSUser
): LookupBatchReturn {
  const database = sqlite(databasePath)

  const rightNow = new Date()

  const info = database
    .prepare(
      `update LicencePlateLookupBatches
        set lockDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchId = ?
        and recordDelete_timeMillis is null
        and lockDate is null`
    )
    .run(
      dateTimeFns.dateToInteger(rightNow),
      sessionUser.userName,
      rightNow.getTime(),
      batchId
    )

  if (info.changes > 0) {
    database
      .prepare(
        `insert into ParkingTicketStatusLog (
          ticketId, statusIndex,
          statusDate, statusTime,
          statusKey, statusField, statusNote,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          
          select t.ticketId, ifnull(max(s.statusIndex), 0) + 1 as statusIndex,
          ? as statusDate,
          ? as statusTime,
          'ownerLookupPending' as statusKey,
          e.batchId as statusField,
          'Looking up '||e.licencePlateNumber||' '||e.licencePlateProvince||' '||e.licencePlateCountry as statusNote,
          ? as recordCreate_userName,
          ? as recordCreate_timeMillis,
          ? as recordUpdate_userName,
          ? as recordUpdate_timeMillis
          from LicencePlateLookupBatchEntries e
          left join ParkingTickets t
            on e.licencePlateCountry = t.licencePlateCountry
            and e.licencePlateProvince = t.licencePlateProvince
            and e.licencePlateNumber = t.licencePlateNumber
          left join ParkingTicketStatusLog s on t.ticketId = s.ticketId
          where e.batchId = ?
          and (
            e.ticketId = t.ticketId
            or (t.recordDelete_timeMillis is null and t.resolvedDate is null))
          group by t.ticketId, e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber, e.batchId
          having max(case when s.statusKey in ('ownerLookupPending', 'ownerLookupMatch', 'ownerLookupError') and s.recordDelete_timeMillis is null then 1 else 0 end) = 0`
      )
      .run(
        dateTimeFns.dateToInteger(rightNow),
        dateTimeFns.dateToTimeInteger(rightNow),
        sessionUser.userName,
        rightNow.getTime(),
        sessionUser.userName,
        rightNow.getTime(),
        batchId
      )
  }

  database.close()

  return {
    success: info.changes > 0
  }
}

export default lockLookupBatch
