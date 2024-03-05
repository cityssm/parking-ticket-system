import * as dateTimeFns from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicket } from '../../types/recordTypes.js'

export default function getParkingTicketsAvailableForMTOLookup(
  currentBatchId: number,
  issueDaysAgo: number
): ParkingTicket[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  database.function(
    'userFn_dateIntegerToString',
    dateTimeFns.dateIntegerToString
  )

  let issueDateNumber = 1e8 // 10000_00_00 (a number bigger than any possible date)

  if (issueDaysAgo !== -1) {
    const issueDate = new Date()
    issueDate.setDate(issueDate.getDate() - issueDaysAgo)
    issueDateNumber = dateTimeFns.dateToInteger(issueDate) as number
  }

  const tickets = database
    .prepare(
      `select t.ticketId, t.ticketNumber,
        t.issueDate, userFn_dateIntegerToString(t.issueDate) as issueDateString,
        t.licencePlateNumber,
        max(
          case when b.mto_includeLabels is not null and b.mto_includeLabels = 0
          then userFn_dateIntegerToString(b.batchDate)
          else null end) as batchStringDate_withoutLabels,
        max(case when b.mto_includeLabels is not null and b.mto_includeLabels = 1
          then userFn_dateIntegerToString(b.batchDate)
          else null end) as batchStringDate_withLabels
        from ParkingTickets t
        left join (
          select e.batchId, b.batchDate, b.mto_includeLabels, e.ticketId,
          e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber
          from LicencePlateLookupBatchEntries e
          left join LicencePlateLookupBatches b on e.batchId = b.batchId
        ) b on t.ticketId = b.ticketId
          and t.licencePlateCountry = b.licencePlateCountry
          and t.licencePlateProvince = b.licencePlateProvince
          and t.licencePlateNumber = b.licencePlateNumber
        
        where t.recordDelete_timeMillis is null
        and t.licencePlateCountry = 'CA'
        and t.licencePlateProvince = 'ON'
        and t.licencePlateNumber != ''
        and t.resolvedDate is null
        and t.ticketId not in (select ticketId from LicencePlateLookupBatchEntries where batchId = ?)
        and t.issueDate < ?
        group by t.ticketId, t.ticketNumber, t.issueDate, t.issueTime, t.licencePlateNumber
        order by t.licencePlateNumber, t.issueDate`
    )
    .all(currentBatchId, issueDateNumber) as ParkingTicket[]

  database.close()

  return tickets
}
