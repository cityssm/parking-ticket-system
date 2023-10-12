import sqlite from 'better-sqlite3'

import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type * as pts from '../../types/recordTypes'

import { canUpdateObject, getSplitWhereClauseFilter } from '../parkingDB.js'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

import type * as expressSession from 'express-session'

export interface GetParkingTicketsQueryOptions {
  isResolved?: boolean
  ticketNumber?: string
  licencePlateNumber?: string
  licencePlateNumberEqual?: string
  licencePlateProvince?: string
  licencePlateCountry?: string
  location?: string
  limit?: number
  offset?: number
}

const addCalculatedFields = (
  ticket: pts.ParkingTicket,
  requestSession: expressSession.Session
) => {
  ticket.recordType = 'ticket'

  ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate)
  ticket.resolvedDateString = dateTimeFns.dateIntegerToString(
    ticket.resolvedDate
  )

  ticket.latestStatus_statusDateString = dateTimeFns.dateIntegerToString(
    ticket.latestStatus_statusDate
  )

  ticket.canUpdate = canUpdateObject(ticket, requestSession)
}

const buildWhereClause = (queryOptions: GetParkingTicketsQueryOptions) => {
  const sqlParameters: Array<number | string> = []

  let sqlWhereClause = ' where t.recordDelete_timeMillis is null'

  if (Object.prototype.hasOwnProperty.call(queryOptions, 'isResolved')) {
    sqlWhereClause += queryOptions.isResolved
      ? ' and t.resolvedDate is not null'
      : ' and t.resolvedDate is null'
  }

  if (queryOptions.ticketNumber && queryOptions.ticketNumber !== '') {
    const filter = getSplitWhereClauseFilter(
      't.ticketNumber',
      queryOptions.ticketNumber
    )
    sqlWhereClause += filter.sqlWhereClause
    sqlParameters.push(...filter.sqlParams)
  }

  if (
    queryOptions.licencePlateNumber &&
    queryOptions.licencePlateNumber !== ''
  ) {
    const filter = getSplitWhereClauseFilter(
      't.licencePlateNumber',
      queryOptions.licencePlateNumber
    )
    sqlWhereClause += filter.sqlWhereClause
    sqlParameters.push(...filter.sqlParams)
  }

  if (
    queryOptions.licencePlateNumberEqual &&
    queryOptions.licencePlateNumberEqual !== ''
  ) {
    sqlWhereClause += ' and t.licencePlateNumber = ?'
    sqlParameters.push(queryOptions.licencePlateNumberEqual)
  }

  if (
    queryOptions.licencePlateProvince &&
    queryOptions.licencePlateProvince !== ''
  ) {
    sqlWhereClause += ' and t.licencePlateProvince = ?'
    sqlParameters.push(queryOptions.licencePlateProvince)
  }

  if (
    queryOptions.licencePlateCountry &&
    queryOptions.licencePlateCountry !== ''
  ) {
    sqlWhereClause += ' and t.licencePlateCountry = ?'
    sqlParameters.push(queryOptions.licencePlateCountry)
  }

  if (queryOptions.location && queryOptions.location !== '') {
    const locationPieces = queryOptions.location.toLowerCase().split(' ')

    for (const locationPiece of locationPieces) {
      sqlWhereClause +=
        ' and (instr(lower(t.locationDescription), ?) or instr(lower(l.locationName), ?))'
      sqlParameters.push(locationPiece, locationPiece)
    }
  }

  return {
    sqlWhereClause,
    sqlParams: sqlParameters
  }
}

interface GetParkingTicketsReturn {
  count: number
  limit: number
  offset: number
  tickets: pts.ParkingTicket[]
}

export const getParkingTickets = (
  requestSession: expressSession.Session,
  queryOptions: GetParkingTicketsQueryOptions
): GetParkingTicketsReturn => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  // build where clause

  const sqlWhereClause = buildWhereClause(queryOptions)

  // get the count

  const count = (
    database
      .prepare(
        'select ifnull(count(*), 0) as cnt' +
          ' from ParkingTickets t' +
          ' left join ParkingLocations l on t.locationKey = l.locationKey' +
          sqlWhereClause.sqlWhereClause
      )
      .get(sqlWhereClause.sqlParams) as { cnt: number }
  ).cnt

  // do query

  const rows = database
    .prepare(
      'select t.ticketID, t.ticketNumber, t.issueDate,' +
        ' t.licencePlateCountry, t.licencePlateProvince, t.licencePlateNumber, t.licencePlateIsMissing,' +
        ' t.locationKey, l.locationName, l.locationClassKey, t.locationDescription,' +
        ' t.parkingOffence, t.offenceAmount, t.resolvedDate,' +
        ' s.statusDate as latestStatus_statusDate,' +
        ' s.statusKey as latestStatus_statusKey,' +
        ' t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis' +
        ' from ParkingTickets t' +
        ' left join ParkingLocations l on t.locationKey = l.locationKey' +
        ' left join ParkingTicketStatusLog s on t.ticketID = s.ticketID' +
        (' and s.statusIndex = (' +
          'select statusIndex from ParkingTicketStatusLog s' +
          ' where t.ticketID = s.ticketID' +
          ' and s.recordDelete_timeMillis is null' +
          ' order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)') +
        sqlWhereClause.sqlWhereClause +
        ' order by t.issueDate desc, t.ticketNumber desc' +
        ' limit ' +
        queryOptions.limit.toString() +
        ' offset ' +
        queryOptions.offset.toString()
    )
    .all(sqlWhereClause.sqlParams) as pts.ParkingTicket[]

  database.close()

  for (const ticket of rows) {
    addCalculatedFields(ticket, requestSession)
  }

  return {
    count,
    limit: queryOptions.limit,
    offset: queryOptions.offset,
    tickets: rows
  }
}

export const getParkingTicketsByLicencePlate = (
  licencePlateCountry: string,
  licencePlateProvince: string,
  licencePlateNumber: string,
  requestSession: expressSession.Session
): pts.ParkingTicket[] => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const sqlWhereClause = buildWhereClause({
    licencePlateCountry,
    licencePlateProvince,
    licencePlateNumberEqual: licencePlateNumber
  })

  const rows = database
    .prepare(
      `select t.ticketID, t.ticketNumber, t.issueDate, t.vehicleMakeModel,
        t.locationKey, l.locationName, l.locationClassKey, t.locationDescription,
        t.parkingOffence, t.offenceAmount, t.resolvedDate,
        s.statusDate as latestStatus_statusDate, s.statusKey as latestStatus_statusKey,
        t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis
        from ParkingTickets t
        left join ParkingLocations l on t.locationKey = l.locationKey
        left join ParkingTicketStatusLog s on t.ticketID = s.ticketID
          and s.statusIndex = (select statusIndex from ParkingTicketStatusLog s where t.ticketID = s.ticketID order by s.statusDate desc, s.statusTime desc, s.statusIndex desc limit 1)
      ${sqlWhereClause.sqlWhereClause}
      order by t.issueDate desc, t.ticketNumber desc`
    )
    .all(sqlWhereClause.sqlParams) as pts.ParkingTicket[]

  database.close()

  for (const ticket of rows) {
    addCalculatedFields(ticket, requestSession)
  }

  return rows
}

export default getParkingTickets