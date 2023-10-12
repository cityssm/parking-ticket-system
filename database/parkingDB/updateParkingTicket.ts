import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import * as configFunctions from '../../helpers/functions.config.js'
import type { ParkingTicket } from '../../types/recordTypes.js'

export const getLicencePlateExpiryDateFromPieces = (
  requestBody: ParkingTicket
): { success: boolean; message?: string; licencePlateExpiryDate?: number } => {
  let licencePlateExpiryDate = 0

  const licencePlateExpiryYear =
    Number.parseInt(requestBody.licencePlateExpiryYear as string, 10) ?? 0
  const licencePlateExpiryMonth =
    Number.parseInt(requestBody.licencePlateExpiryMonth as string, 10) ?? 0

  if (licencePlateExpiryYear === 0 && licencePlateExpiryMonth === 0) {
    licencePlateExpiryDate = 0
  } else if (licencePlateExpiryYear === 0 || licencePlateExpiryMonth === 0) {
    return {
      success: false,
      message:
        'The licence plate expiry date fields must both be blank or both be completed.'
    }
  } else {
    const dateObject = new Date(
      licencePlateExpiryYear,
      licencePlateExpiryMonth - 1 + 1,
      // eslint-disable-next-line sonarjs/no-identical-expressions
      1 - 1,
      0,
      0,
      0,
      0
    )

    licencePlateExpiryDate = dateTimeFns.dateToInteger(dateObject)
  }

  return {
    success: true,
    licencePlateExpiryDate
  }
}

export const updateParkingTicket = (
  requestBody: ParkingTicket,
  requestSession: expressSession.Session
): { success: boolean; message?: string } => {
  const database = sqlite(databasePath)

  const nowMillis = Date.now()

  const issueDate = dateTimeFns.dateStringToInteger(requestBody.issueDateString)

  if (configFunctions.getProperty('parkingTickets.ticketNumber.isUnique')) {
    // Ensure ticket number has not been used in the last two years

    const duplicateTicket = database
      .prepare(
        'select ticketID from ParkingTickets' +
          ' where recordDelete_timeMillis is null' +
          ' and ticketNumber = ?' +
          ' and ticketID != ?' +
          ' and abs(issueDate - ?) <= 20000'
      )
      .get(requestBody.ticketNumber, requestBody.ticketID, issueDate)

    if (duplicateTicket) {
      database.close()

      return {
        success: false,
        message:
          'A ticket with the same ticket number was seen in the last two years.'
      }
    }
  }

  let licencePlateExpiryDate = dateTimeFns.dateStringToInteger(
    requestBody.licencePlateExpiryDateString as string
  )

  if (
    !configFunctions.getProperty(
      'parkingTickets.licencePlateExpiryDate.includeDay'
    )
  ) {
    const licencePlateExpiryDateReturn =
      getLicencePlateExpiryDateFromPieces(requestBody)

    if (licencePlateExpiryDateReturn.success) {
      licencePlateExpiryDate =
        licencePlateExpiryDateReturn.licencePlateExpiryDate as number
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
      `update ParkingTickets
        set ticketNumber = ?,
        issueDate = ?,
        issueTime = ?,
        issuingOfficer = ?,
        locationKey = ?,
        locationDescription = ?,
        bylawNumber = ?,
        parkingOffence = ?,
        offenceAmount = ?,
        discountOffenceAmount = ?,
        discountDays = ?,
        licencePlateCountry = ?,
        licencePlateProvince = ?,
        licencePlateNumber = ?,
        licencePlateIsMissing = ?,
        licencePlateExpiryDate = ?,
        vehicleMakeModel = ?,
        vehicleVIN = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where ticketID = ?
        and resolvedDate is null
        and recordDelete_timeMillis is null`
    )
    .run(
      requestBody.ticketNumber,
      issueDate,
      dateTimeFns.timeStringToInteger(requestBody.issueTimeString),
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
      requestSession.user.userName,
      nowMillis,
      requestBody.ticketID
    )

  database.close()

  return info.changes > 0
    ? {
        success: true
      }
    : {
        success: false,
        message: 'An error occurred saving this ticket.  Please try again.'
      }
}

export default updateParkingTicket
