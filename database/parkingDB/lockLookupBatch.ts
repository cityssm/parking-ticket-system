import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

import type { LookupBatchReturn } from './getLookupBatch.js'

export const lockLookupBatch = (
  batchID: number,
  requestSession: expressSession.Session
): LookupBatchReturn => {
  const database = sqlite(databasePath)

  const rightNow = new Date()

  const info = database
    .prepare(
      'update LicencePlateLookupBatches' +
        ' set lockDate = ?,' +
        ' recordUpdate_userName = ?,' +
        ' recordUpdate_timeMillis = ?' +
        ' where batchID = ?' +
        ' and recordDelete_timeMillis is null' +
        ' and lockDate is null'
    )
    .run(
      dateTimeFns.dateToInteger(rightNow),
      requestSession.user.userName,
      rightNow.getTime(),
      batchID
    )

  if (info.changes > 0) {
    database
      .prepare(
        'insert into ParkingTicketStatusLog' +
          ' (ticketID, statusIndex, statusDate, statusTime, statusKey, statusField, statusNote,' +
          ' recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)' +
          ' select t.ticketID,' +
          ' ifnull(max(s.statusIndex), 0) + 1 as statusIndex,' +
          ' ? as statusDate,' +
          ' ? as statusTime,' +
          " 'ownerLookupPending' as statusKey," +
          ' e.batchID as statusField,' +
          " 'Looking up '||e.licencePlateNumber||' '||e.licencePlateProvince||' '||e.licencePlateCountry as statusNote," +
          ' ? as recordCreate_userName,' +
          ' ? as recordCreate_timeMillis,' +
          ' ? as recordUpdate_userName,' +
          ' ? as recordUpdate_timeMillis' +
          ' from LicencePlateLookupBatchEntries e' +
          ' left join ParkingTickets t' +
          ' on e.licencePlateCountry = t.licencePlateCountry' +
          ' and e.licencePlateProvince = t.licencePlateProvince' +
          ' and e.licencePlateNumber = t.licencePlateNumber' +
          ' left join ParkingTicketStatusLog s on t.ticketID = s.ticketID' +
          ' where e.batchID = ?' +
          ' and (e.ticketID = t.ticketID or (t.recordDelete_timeMillis is null and t.resolvedDate is null))' +
          ' group by t.ticketID, e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber, e.batchID' +
          ' having max(' +
          ("case when s.statusKey in ('ownerLookupPending', 'ownerLookupMatch', 'ownerLookupError')" +
            ' and s.recordDelete_timeMillis is null then 1') +
          ' else 0' +
          ' end) = 0'
      )
      .run(
        dateTimeFns.dateToInteger(rightNow),
        dateTimeFns.dateToTimeInteger(rightNow),
        requestSession.user.userName,
        rightNow.getTime(),
        requestSession.user.userName,
        rightNow.getTime(),
        batchID
      )
  }

  database.close()

  return {
    success: info.changes > 0
  }
}

export default lockLookupBatch
