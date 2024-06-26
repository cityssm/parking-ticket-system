import {
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import { getConfigProperty } from '../../helpers/functions.config.js'
import type { ParkingTicket } from '../../types/recordTypes.js'

import { getLicencePlateExpiryDateFromPieces } from './updateParkingTicket.js'

function hasDuplicateTicket(
  ticketNumber: string,
  issueDate: number,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(databasePath)

  const duplicateTicketId = database
    .prepare(
      `select ticketId from ParkingTickets
        where recordDelete_timeMillis is null
        and ticketNumber = ?
        and abs(issueDate - ?) <= 20000`
    )
    .pluck()
    .get(ticketNumber, issueDate) as number | null | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return (duplicateTicketId ?? undefined) !== undefined
}

interface CreateParkingTicketReturn {
  success: boolean
  message?: string
  ticketId?: number
  nextTicketNumber?: string
}

export default function createParkingTicket(
  requestBody: ParkingTicket,
  sessionUser: PTSUser
): CreateParkingTicketReturn {
  const database = sqlite(databasePath)

  const nowMillis = Date.now()

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const issueDate = dateStringToInteger(requestBody.issueDateString) as number

  if (
    getConfigProperty('parkingTickets.ticketNumber.isUnique') &&
    hasDuplicateTicket(requestBody.ticketNumber, issueDate, database)
  ) {
    database.close()

    return {
      success: false,
      message:
        'A ticket with the same ticket number was seen in the last two years.'
    }
  }

  let licencePlateExpiryDate = dateStringToInteger(
    requestBody.licencePlateExpiryDateString ?? ''
  )

  if (!getConfigProperty('parkingTickets.licencePlateExpiryDate.includeDay')) {
    const licencePlateExpiryDateReturn =
      getLicencePlateExpiryDateFromPieces(requestBody)

    if (licencePlateExpiryDateReturn.success) {
      licencePlateExpiryDate =
        licencePlateExpiryDateReturn.licencePlateExpiryDate ?? 0
    } else {
      database.close()

      return {
        success: false,
        message: licencePlateExpiryDateReturn.message
      }
    }
  }

  const info = database
    .prepare(
      `insert into ParkingTickets (ticketNumber,
        issueDate, issueTime, issuingOfficer,
        locationKey, locationDescription,
        bylawNumber,
        parkingOffence, offenceAmount, discountOffenceAmount, discountDays,
        licencePlateCountry, licencePlateProvince, licencePlateNumber,
        licencePlateIsMissing, licencePlateExpiryDate,
        vehicleMakeModel, vehicleVIN,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      requestBody.ticketNumber,
      issueDate,
      timeStringToInteger(requestBody.issueTimeString),
      requestBody.issuingOfficer,
      requestBody.locationKey,
      requestBody.locationDescription,
      requestBody.bylawNumber,
      requestBody.parkingOffence,
      requestBody.offenceAmount,
      requestBody.discountOffenceAmount,
      requestBody.discountDays,
      requestBody.licencePlateCountry,
      requestBody.licencePlateProvince,
      requestBody.licencePlateNumber,
      requestBody.licencePlateIsMissing ? 1 : 0,
      licencePlateExpiryDate,
      requestBody.vehicleMakeModel,
      requestBody.vehicleVIN,
      sessionUser.userName,
      nowMillis,
      sessionUser.userName,
      nowMillis
    )

  database.close()

  return {
    success: true,
    ticketId: info.lastInsertRowid as number,
    nextTicketNumber: undefined // populated in handler
  }
}
