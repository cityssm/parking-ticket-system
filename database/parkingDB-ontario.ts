/* eslint-disable eslint-comments/disable-enable-pair, unicorn/filename-case */

import { dateIntegerToString, dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../data/databasePaths.js'
import type { ParkingTicket } from '../types/recordTypes.js'

export function getParkingTicketsAvailableForMTOConvictionBatch(): ParkingTicket[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const issueDate = new Date()
  issueDate.setDate(issueDate.getDate() - 60)
  const issueDateNumber = dateToInteger(issueDate)

  const parkingTickets = database
    .prepare(
      'select t.ticketId, t.ticketNumber, t.issueDate, t.licencePlateNumber,' +
        ' o.ownerName1 as licencePlateOwner_ownerName1' +
        ' from ParkingTickets t' +
        // Matching Ownership Record
        (' inner join ParkingTicketStatusLog ol on t.ticketId = ol.ticketId' +
          ' and ol.recordDelete_timeMillis is null' +
          " and ol.statusKey = 'ownerLookupMatch'") +
        (' left join LicencePlateOwners o' +
          ' on t.licencePlateCountry = o.licencePlateCountry' +
          ' and t.licencePlateProvince = o.licencePlateProvince' +
          ' and t.licencePlateNumber = o.licencePlateNumber' +
          ' and ol.statusField = o.recordDate' +
          ' and o.recordDelete_timeMillis is null') +
        ' where t.recordDelete_timeMillis is null' +
        // Province of Ontario
        " and t.licencePlateCountry = 'CA'" +
        " and t.licencePlateProvince = 'ON'" +
        " and t.licencePlateNumber != ''" +
        ' and t.issueDate <= ?' +
        // No Trial Requested
        // Not Part of Another Conviction Batch
        (' and not exists (' +
          'select 1 from ParkingTicketStatusLog s' +
          ' where t.ticketId = s.ticketId' +
          ' and s.recordDelete_timeMillis is null' +
          " and s.statusKey in ('trial', 'convictionBatch')" +
          ')') +
        // Unresolved or Resolved with Convicted Status
        (' and (' +
          't.resolvedDate is null' +
          ' or exists (' +
          'select 1 from ParkingTicketStatusLog s' +
          ' where t.ticketId = s.ticketId' +
          ' and s.recordDelete_timeMillis is null' +
          " and s.statusKey = 'convicted'" +
          ')' +
          ')') +
        ' order by ticketNumber'
    )
    .all(issueDateNumber) as ParkingTicket[]

  database.close()

  for (const ticket of parkingTickets) {
    ticket.issueDateString = dateIntegerToString(ticket.issueDate)
  }

  return parkingTickets
}
