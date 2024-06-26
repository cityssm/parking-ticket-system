/* eslint-disable eslint-comments/disable-enable-pair, unicorn/filename-case */

import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../data/databasePaths.js'
import { getConfigProperty } from '../helpers/functions.config.js'

function getCleanupRecordDeleteTimeMillis(
  possibleRecordDeleteTimeMillis: string
): number {
  return (possibleRecordDeleteTimeMillis ?? '') === ''
    ? Date.now() -
        getConfigProperty('databaseCleanup.windowDays') * 86_400 * 1000
    : Number.parseInt(possibleRecordDeleteTimeMillis)
}

/*
 * Report Definitions
 */

interface ReportDefinition {
  sql: string
  getParams?: (parameters: Record<string, string>) => Array<string | number>
}

const reportDefinitions = new Map<string, ReportDefinition>()

reportDefinitions.set('tickets-all', {
  sql: 'select * from ParkingTickets'
})

reportDefinitions.set('tickets-unresolved', {
  sql: `select t.ticketId, t.ticketNumber, t.issueDate,
    t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber,
    t.locationKey, l.locationName, l.locationClassKey, t.locationDescription,
    t.parkingOffence, t.offenceAmount,
    s.statusDate as latestStatus_statusDate,
    s.statusKey as latestStatus_statusKey,
    t.recordCreate_userName, t.recordCreate_timeMillis,
    t.recordUpdate_userName, t.recordUpdate_timeMillis
    from ParkingTickets t
    left join ParkingLocations l on t.locationKey = l.locationKey
    left join ParkingTicketStatusLog s
      on t.ticketId = s.ticketId
      and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketId = s.ticketId order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)
    where t.recordDelete_timeMillis is null
    and t.resolvedDate is null`
})

reportDefinitions.set('statuses-all', {
  sql: 'select * from ParkingTicketStatusLog'
})

reportDefinitions.set('statuses-byTicketId', {
  sql: `select * from ParkingTicketStatusLog
    where recordDelete_timeMillis is null
    and ticketId = ?`,

  getParams: (requestQuery) => [requestQuery.ticketId]
})

reportDefinitions.set('remarks-all', {
  sql: 'select * from ParkingTicketRemarks'
})

reportDefinitions.set('remarks-byTicketId', {
  sql: `select * from ParkingTicketRemarks
    where recordDelete_timeMillis is null
    and ticketId = ?`,

  getParams: (requestQuery) => [requestQuery.ticketId]
})

reportDefinitions.set('owners-all', {
  sql: 'select * from LicencePlateOwners'
})

reportDefinitions.set('owners-reconcile', {
  sql: `select t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber,
    t.ticketId as ticket_ticketId, t.ticketNumber as ticket_ticketNumber,
    t.issueDate as ticket_issueDate,
    t.vehicleMakeModel as ticket_vehicleMakeModel,
    t.licencePlateExpiryDate as ticket_licencePlateExpiryDate,
    o.recordDate as owner_recordDate,
    o.vehicleNCIC as owner_vehicleNCIC, o.vehicleYear as owner_vehicleYear, o.vehicleColor as owner_vehicleColor,
    o.licencePlateExpiryDate as owner_licencePlateExpiryDate,
    o.ownerName1 as owner_ownerName1, o.ownerName2 as owner_ownerName2,
    o.ownerAddress as owner_ownerAddress,
    o.ownerCity as owner_ownerCity, o.ownerProvince as owner_ownerProvince,
    o.ownerPostalCode as owner_ownerPostalCode
    from ParkingTickets t
    inner join LicencePlateOwners o
      on t.licencePlateCountry = o.licencePlateCountry
      and t.licencePlateProvince = o.licencePlateProvince
      and t.licencePlateNumber = o.licencePlateNumber
      and o.recordDelete_timeMillis is null
      and o.vehicleNCIC <> ''
      and o.recordDate = (
        select o2.recordDate from LicencePlateOwners o2
        where t.licencePlateCountry = o2.licencePlateCountry
          and t.licencePlateProvince = o2.licencePlateProvince
          and t.licencePlateNumber = o2.licencePlateNumber
          and o2.recordDelete_timeMillis is null
          and t.issueDate <= o2.recordDate
        order by o2.recordDate
        limit 1
      )
    where t.recordDelete_timeMillis is null
      and t.resolvedDate is null
      and not exists (
        select 1 from ParkingTicketStatusLog s
        where t.ticketId = s.ticketId
        and s.statusKey in ('ownerLookupMatch', 'ownerLookupError')
        and s.recordDelete_timeMillis is null
      )`
})

reportDefinitions.set('lookupErrorLog-all', {
  sql: 'select * from LicencePlateLookupErrorLog'
})

reportDefinitions.set('offences-all', {
  sql: 'select * from ParkingOffences'
})

reportDefinitions.set('locations-all', {
  sql: 'select * from ParkingLocations'
})

reportDefinitions.set('locations-usageByYear', {
  sql: `select l.locationKey, l.locationName, l.locationClassKey, l.isActive,
    cast(round (issueDate / 10000 - 0.5) as integer) as issueYear,
    count(ticketId) as ticket_count,
    min(issueDate) as issueDate_min,
    max(issueDate) as issueDate_max,
    min(offenceAmount) as offenceAmount_min,
    max(offenceAmount) as offenceAmount_max,
    sum(case when resolvedDate is null then 0 else 1 end) as isResolved_count
    from ParkingLocations l
    inner join ParkingTickets t on l.locationKey = t.locationKey
    where t.recordDelete_timeMillis is null
    group by l.locationKey, l.locationName, l.locationClassKey, l.isActive,
      round (issueDate / 10000 - 0.5)`
})

reportDefinitions.set('bylaws-all', {
  sql: 'select * from ParkingBylaws'
})

reportDefinitions.set('bylaws-usageByYear', {
  sql: `select b.bylawNumber, b.bylawDescription,
    b.isActive,
    cast(round (issueDate / 10000 - 0.5) as integer) as issueYear,
    count(ticketId) as ticket_count,
    min(issueDate) as issueDate_min,
    max(issueDate) as issueDate_max,
    min(offenceAmount) as offenceAmount_min,
    max(offenceAmount) as offenceAmount_max,
    sum(case when resolvedDate is null then 0 else 1 end) as isResolved_count
    from ParkingBylaws b
    inner join ParkingTickets t on b.bylawNumber = t.bylawNumber
    where t.recordDelete_timeMillis is null
    group by b.bylawNumber, b.bylawDescription, b.isActive, round (issueDate / 10000 - 0.5)`
})

reportDefinitions.set('cleanup-parkingTickets', {
  sql: `select * from ParkingTickets t
    where t.recordDelete_timeMillis is not null
    and t.recordDelete_timeMillis < ?
    and not exists (select 1 from LicencePlateLookupBatchEntries b where t.ticketId = b.ticketId)`,

  getParams: (requestQuery) => [
    getCleanupRecordDeleteTimeMillis(requestQuery.recordDelete_timeMillis)
  ]
})

reportDefinitions.set('cleanup-parkingTicketStatusLog', {
  sql: `select * from ParkingTicketStatusLog
    where recordDelete_timeMillis is not null
    and recordDelete_timeMillis < ?`,

  getParams: (requestQuery) => [
    getCleanupRecordDeleteTimeMillis(requestQuery.recordDelete_timeMillis)
  ]
})

reportDefinitions.set('cleanup-parkingTicketRemarks', {
  sql: `select * from ParkingTicketRemarks
    where recordDelete_timeMillis is not null
    and recordDelete_timeMillis < ?`,

  getParams: (requestQuery) => [
    getCleanupRecordDeleteTimeMillis(requestQuery.recordDelete_timeMillis)
  ]
})

reportDefinitions.set('cleanup-licencePlateOwners', {
  sql: `select * from LicencePlateOwners
    where recordDelete_timeMillis is not null
    and recordDelete_timeMillis < ?`,

  getParams: (requestQuery) => [
    getCleanupRecordDeleteTimeMillis(requestQuery.recordDelete_timeMillis)
  ]
})

reportDefinitions.set('cleanup-parkingOffences', {
  sql: `select * from ParkingOffences o
    where isActive = 0
    and not exists (
      select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)`
})

reportDefinitions.set('cleanup-parkingBylaws', {
  sql: `select * from ParkingBylaws b
    where isActive = 0
    and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)
    and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)`
})

reportDefinitions.set('cleanup-parkingLocations', {
  sql: `select * from ParkingLocations l
    where isActive = 0
    and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)
    and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)`
})

export function getReportData(
  reportName: string,
  requestQuery: Record<string, string>
): unknown[] {
  let reportDefinition: ReportDefinition
  let sql: string
  let sqlParameters: unknown[] = []

  // eslint-disable-next-line sonarjs/no-small-switch
  switch (reportName) {
    case 'lookupAudit': {
      sql = `select b.batchId,
        sentDate as batchSentDate,
        e.licencePlateCountry, e.licencePlateProvince, e.licencePlateNumber,
        e.ticketId as ticketId, t.ticketNumber as ticketNumber
        from LicencePlateLookupBatches b
        left join LicencePlateLookupBatchEntries e on b.batchId = e.batchId
        left join ParkingTickets t on e.ticketId = t.ticketId
        where b.sentDate is not null`

      if ((requestQuery.batchId ?? '') !== '') {
        sql += ' and b.batchId = ?'
        sqlParameters.push(requestQuery.batchId)
      }

      break
    }

    default: {
      reportDefinition = reportDefinitions.get(reportName) as ReportDefinition
      sql = reportDefinition.sql

      if (reportDefinition.getParams !== undefined) {
        sqlParameters = reportDefinition.getParams(requestQuery)
      }
    }
  }

  const database = sqlite(databasePath, {
    readonly: true
  })

  const rows = database.prepare(sql).all(sqlParameters)

  database.close()

  return rows
}
