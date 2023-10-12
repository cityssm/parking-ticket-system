import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'
import type { ParkingOffence } from '../../types/recordTypes.js'

import type { AddUpdateParkingOffenceReturn } from './getParkingOffences.js'

export const addParkingOffence = (
  requestBody: ParkingOffence
): AddUpdateParkingOffenceReturn => {
  const database = sqlite(databasePath)

  // Check if offence already exists

  const existingOffenceRecord = database
    .prepare(
      `select isActive
        from ParkingOffences
        where bylawNumber = ?
        and locationKey = ?`
    )
    .get(requestBody.bylawNumber, requestBody.locationKey) as
    | ParkingOffence
    | undefined

  if (existingOffenceRecord !== undefined) {
    if (existingOffenceRecord.isActive) {
      database.close()

      return {
        success: false,
        message:
          'An active offence already exists for the same location and by-law.'
      }
    } else {
      const info = database
        .prepare(
          'update ParkingOffences' +
            ' set isActive = 1' +
            ' where bylawNumber = ?' +
            ' and locationKey = ?'
        )
        .run(requestBody.bylawNumber, requestBody.locationKey)

      database.close()

      return {
        success: info.changes > 0,
        message:
          'A previously deleted offence for the same location and by-law has been restored.'
      }
    }
  }

  // Check if another offence exists for the same by-law
  // If so, use the same offenceAmount

  let offenceAmount = 0
  let discountOffenceAmount = 0
  let discountDays = 0

  if (Object.prototype.hasOwnProperty.call(requestBody, 'offenceAmount')) {
    offenceAmount = requestBody.offenceAmount

    discountOffenceAmount = Object.prototype.hasOwnProperty.call(
      requestBody,
      'discountOffenceAmount'
    )
      ? requestBody.discountOffenceAmount
      : requestBody.offenceAmount

    discountDays = requestBody.discountDays || 0
  } else {
    const offenceAmountRecord = database
      .prepare(
        'select offenceAmount, discountOffenceAmount, discountDays' +
          ' from ParkingOffences' +
          ' where bylawNumber = ?' +
          ' and isActive = 1' +
          ' group by offenceAmount, discountOffenceAmount, discountDays' +
          ' order by count(locationKey) desc, offenceAmount desc, discountOffenceAmount desc' +
          ' limit 1'
      )
      .get(requestBody.bylawNumber) as pts.ParkingOffence

    if (offenceAmountRecord) {
      offenceAmount = offenceAmountRecord.offenceAmount
      discountOffenceAmount = offenceAmountRecord.discountOffenceAmount
      discountDays = offenceAmountRecord.discountDays
    }
  }

  // Insert record

  const info = database
    .prepare(
      'insert into ParkingOffences' +
        ' (bylawNumber, locationKey, parkingOffence,' +
        ' offenceAmount, discountOffenceAmount, discountDays,' +
        ' accountNumber, isActive)' +
        ' values (?, ?, ?, ?, ?, ?, ?, 1)'
    )
    .run(
      requestBody.bylawNumber,
      requestBody.locationKey,
      requestBody.parkingOffence || '',
      offenceAmount,
      discountOffenceAmount,
      discountDays,
      requestBody.accountNumber || ''
    )

  database.close()

  return {
    success: info.changes > 0
  }
}

export default addParkingOffence
