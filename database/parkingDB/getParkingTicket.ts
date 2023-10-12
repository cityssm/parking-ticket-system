import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingTicket } from '../../types/recordTypes.js'
import { canUpdateObject } from '../parkingDB.js'

import { getLicencePlateOwnerWithDB } from './getLicencePlateOwner.js'
import { getParkingLocationWithDB } from './getParkingLocation.js'
import { getParkingTicketRemarksWithDB } from './getParkingTicketRemarks.js'
import { getParkingTicketStatusesWithDB } from './getParkingTicketStatuses.js'

export const getParkingTicket = (
  ticketID: number,
  requestSession: expressSession.Session
): ParkingTicket | undefined => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const ticket = database
    .prepare(
      'select t.*,' +
        ' l.locationName,' +
        ' s.statusKey as ownerLookup_statusKey,' +
        ' s.statusField as ownerLookup_statusField' +
        ' from ParkingTickets t' +
        (' left join ParkingTicketStatusLog s' +
          ' on t.ticketID = s.ticketID' +
          " and s.statusKey in ('ownerLookupPending', 'ownerLookupError', 'ownerLookupMatch')" +
          ' and s.recordDelete_timeMillis is null') +
        (' left join ParkingLocations l' +
          ' on t.locationKey = l.locationKey') +
        ' where t.ticketID = ?' +
        ' order by s.statusDate desc, s.statusIndex desc' +
        ' limit 1'
    )
    .get(ticketID) as ParkingTicket

  if (!ticket) {
    database.close()
    return undefined
  }

  ticket.recordType = 'ticket'
  ticket.issueDateString = dateTimeFns.dateIntegerToString(ticket.issueDate)
  ticket.issueTimeString = dateTimeFns.timeIntegerToString(ticket.issueTime)

  ticket.licencePlateExpiryDateString = dateTimeFns.dateIntegerToString(
    ticket.licencePlateExpiryDate
  )

  if (ticket.licencePlateExpiryDateString !== '') {
    ticket.licencePlateExpiryYear = Number.parseInt(
      ticket.licencePlateExpiryDateString.slice(0, 4),
      10
    )
    ticket.licencePlateExpiryMonth = Number.parseInt(
      ticket.licencePlateExpiryDateString.slice(5, 7),
      10
    )
  }

  ticket.resolvedDateString = dateTimeFns.dateIntegerToString(
    ticket.resolvedDate
  )
  ticket.canUpdate = canUpdateObject(ticket, requestSession)

  // Owner

  if (ticket.ownerLookup_statusKey === 'ownerLookupMatch') {
    ticket.licencePlateOwner = getLicencePlateOwnerWithDB(
      database,
      ticket.licencePlateCountry,
      ticket.licencePlateProvince,
      ticket.licencePlateNumber,
      Number.parseInt(ticket.ownerLookup_statusField, 10)
    )
  }

  // Location

  ticket.location = getParkingLocationWithDB(database, ticket.locationKey)

  // Status Log

  ticket.statusLog = getParkingTicketStatusesWithDB(
    database,
    ticketID,
    requestSession
  )

  if (!ticket.canUpdate) {
    for (const status of ticket.statusLog) {
      status.canUpdate = false
    }
  }

  // Remarks

  ticket.remarks = getParkingTicketRemarksWithDB(
    database,
    ticketID,
    requestSession
  )

  if (!ticket.canUpdate) {
    for (const remark of ticket.remarks) {
      remark.canUpdate = false
    }
  }

  database.close()

  return ticket
}

export default getParkingTicket