// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/indent */

import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import sqlite from 'better-sqlite3'
import type * as expressSession from 'express-session'

import { parkingDB as databasePath } from '../data/databasePaths.js'
import { getConvictionBatch } from '../database/parkingDB/getConvictionBatch.js'
import { getLookupBatch } from '../database/parkingDB/getLookupBatch.js'
import { markConvictionBatchAsSent } from '../database/parkingDB/markConvictionBatchAsSent.js'
import { markLookupBatchAsSent } from '../database/parkingDB/markLookupBatchAsSent.js'
import type { ParkingTicketStatusLog } from '../types/recordTypes.js'

import * as configFunctions from './functions.config.js'

let currentDate: Date
let currentDateNumber: number
let currentDatePrefix: number
let currentYearPrefix: number

function resetCurrentDate(): void {
  currentDate = new Date()
  currentDateNumber = dateTimeFns.dateToInteger(currentDate)

  currentYearPrefix = Math.floor(currentDate.getFullYear() / 100) * 100
  currentDatePrefix = currentYearPrefix * 10_000
}

resetCurrentDate()

export function twoDigitYearToFourDigit(twoDigitYear: number): number {
  const fourDigitYear = twoDigitYear + currentYearPrefix

  if (fourDigitYear > currentDate.getFullYear() + 10) {
    return fourDigitYear - 100
  } else if (currentDate.getFullYear() - fourDigitYear > 60) {
    return fourDigitYear + 100
  }

  return fourDigitYear
}

export function sixDigitDateNumberToEightDigit(
  sixDigitDateNumber: number
): number {
  const eightDigitDateNumber = sixDigitDateNumber + currentDatePrefix

  if (eightDigitDateNumber > currentDateNumber) {
    return eightDigitDateNumber - 1_000_000
  }

  return eightDigitDateNumber
}

function parsePKRA(rowData: string):
  | false
  | {
      sentDate: number
      recordDate: number
    } {
  if (!rowData.startsWith('PKRA')) {
    return false
  }

  /*
   * PKRA RECORD
   * -----------
   * Record ID    | 4 characters               | "PKRA"
   * DEST-CODE    | 4 characters               | "    "
   * BATCH-NO     | 1 character                | "1"
   * Sent Date    | 6 numbers                  | YYMMDD
   * Record Count | 6 numbers, right justified | "   201"
   * TAPE-NEEDED  | 1 character, Y or N        | Y
   * LABEL-NEEDED | 1 character, Y or N        | N
   * ENTRY-DATE   | 6 numbers                  | YYMMDD
   * Record Date  | 6 numbers                  | YYMMDD
   * FILLER       | 165 characters
   */

  try {
    const record = {
      sentDate: 0,
      recordDate: 0
    }

    const rawSentDate = rowData.slice(9, 15).trim()

    if (rawSentDate === '') {
      return false
    }

    record.sentDate = sixDigitDateNumberToEightDigit(
      Number.parseInt(rawSentDate, 10)
    )

    const rawRecordDate = rowData.slice(29, 35).trim()

    if (rawRecordDate === '') {
      return false
    }

    record.recordDate = sixDigitDateNumberToEightDigit(
      Number.parseInt(rawRecordDate, 10)
    )

    return record
  } catch {
    return false
  }
}

interface PKRDResult {
  licencePlateNumber: string
  issueDate: number
  ticketNumber: string

  driverLicenceNumber: string

  ownerGenderKey: string

  ownerName1: string
  ownerName2: string
  ownerAddress: string
  ownerCity: string
  ownerProvince: string
  ownerPostalCode: string

  vehicleNCIC: string
  vehicleYear: number
  vehicleColor: string

  errorCode: string
  errorMessage: string

  licencePlateExpiryDate: number
}

export const parsePKRD = (rowData: string): false | PKRDResult => {
  if (!rowData.startsWith('PKRD')) {
    return false
  }

  /*
   * PKRD RECORD
   * -----------
   * Record ID                 | 4 characters                  | "PKRD"
   * Licence Plate Number      | 10 characters                 | "XXXX111   "
   * Issue Date                | 6 numbers                     | YYMMDD
   * Ticket Number             | 8 characters                  | "XX00000 "
   * INPUT-MAKE                | 4 characters                  |
   * Driver's Licence Number   | 15 characters                 | "A12345123451234"
   * Birth Date                | 6 numbers                     | YYMMDD
   * Gender                    | 1 character                   | M
   * Owner's Name              | 50 characters, "/" separated  | "DOE,JOHN/DOE,JANE                                 "
   * Address                   | 40 characters, including city | "1234 STREET RD,S STE MARIE             "
   * Postal Code               | 6 characters                  | "A1A1A1"
   * Vehicle NCIC              | 4 characters                  | "CHEV"
   * Vehicle Year              | 2 numbers                     | "17"
   * Odometer Reading          | 8 numbers                     | "123456  "
   * Odometer Unit             | 2 characters                  | "KM"
   * Vehicle Colour            | 3 characters                  | "BLK"
   * Error Code                | 6 characters                  | "WRN262"
   * Error Message             | 29 characters                 | "PLATE WAS UNATTACHED         "
   * Licence Plate Expiry Date | 4 numbers                     | YYMM
   * BRAND                     | 3 characters
   * FILLER                    | 10 characters
   */

  try {
    const record: PKRDResult = {
      licencePlateNumber: '',
      issueDate: 0,
      ticketNumber: '',

      driverLicenceNumber: '',

      ownerGenderKey: '',

      ownerName1: '',
      ownerName2: '',
      ownerAddress: '',
      ownerCity: '',
      ownerProvince: 'ON',
      ownerPostalCode: '',

      vehicleNCIC: '',
      vehicleYear: 0,
      vehicleColor: '',

      errorCode: '',
      errorMessage: '',

      licencePlateExpiryDate: 0
    }

    record.licencePlateNumber = rowData.slice(4, 14).trim()
    record.issueDate = sixDigitDateNumberToEightDigit(
      Number.parseInt(rowData.slice(14, 20), 10)
    )
    record.ticketNumber = rowData.slice(20, 28).trim()

    record.driverLicenceNumber = rowData.slice(32, 47).trim()

    record.ownerGenderKey = rowData.slice(53, 54)

    record.ownerName1 = rowData.slice(54, 104).replaceAll(',', ', ').trim()

    if (record.ownerName1.includes('/')) {
      const slashIndex = record.ownerName1.indexOf('/')

      record.ownerName2 = record.ownerName1.slice(Math.max(0, slashIndex + 1))
      record.ownerName1 = record.ownerName1.slice(0, Math.max(0, slashIndex))
    }

    record.ownerAddress = rowData.slice(104, 144).trim()

    if (record.ownerAddress.includes(',')) {
      const lastCommaIndex = record.ownerAddress.lastIndexOf(',')

      record.ownerCity = record.ownerAddress.slice(
        Math.max(0, lastCommaIndex + 1)
      )
      record.ownerAddress = record.ownerAddress.slice(
        0,
        Math.max(0, lastCommaIndex)
      )

      if (record.ownerCity === 'S STE MARIE') {
        record.ownerCity = 'SAULT STE. MARIE'
      }
    }

    record.ownerPostalCode = rowData.slice(144, 150).trim()

    record.vehicleNCIC = rowData.slice(150, 154).trim()

    record.vehicleYear = twoDigitYearToFourDigit(
      Number.parseInt(rowData.slice(154, 156), 10)
    )

    record.vehicleColor = rowData.slice(166, 169).trim()

    record.errorCode = rowData.slice(169, 175).trim()
    record.errorMessage = rowData.slice(175, 204).trim()

    const expiryYear = twoDigitYearToFourDigit(
      Number.parseInt(rowData.slice(204, 206), 10)
    )

    const expiryDate = new Date(
      expiryYear,
      Number.parseInt(rowData.slice(206, 208), 10) - 1 + 1,
      1
    )
    expiryDate.setDate(expiryDate.getDate() - 1)

    record.licencePlateExpiryDate = dateTimeFns.dateToInteger(expiryDate)

    if (record.errorCode !== '') {
      record.vehicleYear = 0
      record.licencePlateExpiryDate = 0
    }

    return record
  } catch {
    return false
  }
}

interface ImportLicencePlateOwnershipResult {
  success: boolean
  message?: string
  rowCount?: number
  errorCount?: number
  insertedErrorCount?: number
  recordCount?: number
  insertedRecordCount?: number
}

export const importLicencePlateOwnership = (
  batchID: number,
  ownershipData: string,
  requestSession: expressSession.Session
): ImportLicencePlateOwnershipResult => {
  // Split the file into rows

  const ownershipDataRows = ownershipData.split('\n')

  if (ownershipDataRows.length === 0) {
    return {
      success: false,
      message: 'The file contains zero data rows.'
    }
  }

  // Parse the first row

  resetCurrentDate()

  const headerRow = parsePKRA(ownershipDataRows[0])

  if (!headerRow) {
    return {
      success: false,
      message:
        'An error occurred while trying to parse the first row of the file.'
    }
  }

  // Verify the batch with the sent date in the file

  const database = sqlite(databasePath)

  const batchRow = database
    .prepare(
      `select sentDate from LicencePlateLookupBatches
        where batchID = ?
        and recordDelete_timeMillis is null
        and lockDate is not null
        and sentDate is not null`
    )
    .get(batchID) as { sentDate: number } | undefined

  if (batchRow === undefined) {
    database.close()

    return {
      success: false,
      message: 'Batch #' + batchID.toString() + ' is unavailable for imports.'
    }
  } else if (batchRow.sentDate !== headerRow.sentDate) {
    database.close()

    return {
      success: false,
      message:
        'The sent date in the batch record does not match the sent date in the file.'
    }
  }

  database
    .prepare('delete from LicencePlateLookupErrorLog' + ' where batchID = ?')
    .run(batchID)

  // Look through record rows

  let rowCount = 0

  let errorCount = 0
  let insertedErrorCount = 0

  let recordCount = 0
  let insertedRecordCount = 0

  const rightNowMillis = Date.now()

  for (const ownershipDataRow of ownershipDataRows) {
    const recordRow = parsePKRD(ownershipDataRow)

    if (recordRow) {
      rowCount += 1

      if (recordRow.errorCode !== '') {
        errorCount += 1

        insertedErrorCount += database
          .prepare(
            'insert or ignore into LicencePlateLookupErrorLog (' +
              'batchID, logIndex,' +
              ' licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDate,' +
              ' errorCode, errorMessage,' +
              ' recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)' +
              ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
          .run(
            batchID,
            errorCount,
            'CA',
            'ON',
            recordRow.licencePlateNumber,
            headerRow.recordDate,
            recordRow.errorCode,
            recordRow.errorMessage,
            requestSession.user.userName,
            rightNowMillis,
            requestSession.user.userName,
            rightNowMillis
          ).changes
      }

      if (recordRow.ownerName1 !== '') {
        recordCount += 1

        insertedRecordCount += database
          .prepare(
            'insert or ignore into LicencePlateOwners (' +
              'licencePlateCountry, licencePlateProvince, licencePlateNumber, recordDate,' +
              ' vehicleNCIC, vehicleYear, vehicleColor, licencePlateExpiryDate,' +
              ' ownerName1, ownerName2,' +
              ' ownerAddress, ownerCity, ownerProvince, ownerPostalCode, ownerGenderKey,' +
              ' driverLicenceNumber,' +
              ' recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)' +
              ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
          .run(
            'CA',
            'ON',
            recordRow.licencePlateNumber,
            headerRow.recordDate,
            recordRow.vehicleNCIC,
            recordRow.vehicleYear,
            recordRow.vehicleColor,
            recordRow.licencePlateExpiryDate,
            recordRow.ownerName1,
            recordRow.ownerName2,
            recordRow.ownerAddress,
            recordRow.ownerCity,
            recordRow.ownerProvince,
            recordRow.ownerPostalCode,
            recordRow.ownerGenderKey,
            recordRow.driverLicenceNumber,
            requestSession.user.userName,
            rightNowMillis,
            requestSession.user.userName,
            rightNowMillis
          ).changes
      }
    }
  }

  // Update batch

  database
    .prepare(
      'update LicencePlateLookupBatches' +
        ' set receivedDate = ?,' +
        ' recordUpdate_userName = ?,' +
        ' recordUpdate_timeMillis = ?' +
        ' where batchID = ?'
    )
    .run(
      headerRow.recordDate,
      requestSession.user.userName,
      rightNowMillis,
      batchID
    )

  database.close()

  return {
    success: true,
    rowCount,
    errorCount,
    insertedErrorCount,
    recordCount,
    insertedRecordCount
  }
}

function exportBatch(
  sentDate: number,
  includeLabels: boolean,
  batchEntries: Array<{
    ticketID?: number
    ticketNumber?: string
    issueDate?: number
    licencePlateNumber?: string
  }>
): string {
  const newline = '\n'

  let output = ''

  let recordCount = 0

  /*
   * RECORD ROWS
   * -----------
   * Record ID       | 4 characters  | "PKTD"
   * Plate Number    | 10 characters | "XXXX111   "
   * Issue Date      | 6 numbers     | YYMMDD
   * Ticket Number   | 23 characters | "XX00000                  "
   * Authorized User | 4 characters  | "XX00"
   */

  const authorizedUserPadded = (
    configFunctions.getProperty('mtoExportImport.authorizedUser') + '    '
  ).slice(0, 4)

  for (const entry of batchEntries) {
    if (entry.ticketID === null) {
      continue
    }

    recordCount += 1

    output +=
      'PKTD' +
      (entry.licencePlateNumber + '          ').slice(0, 10) +
      entry.issueDate.toString().slice(-6) +
      (entry.ticketNumber + '                       ').slice(0, 23) +
      authorizedUserPadded +
      newline
  }

  const recordCountPadded = ('000000' + recordCount.toString()).slice(-6)

  /*
   * HEADER ROW
   * ----------
   * Record ID    | 4 characters           | "PKTA"
   * Unknown      | 5 characters           | "    1"
   * Export Date  | 6 numbers              | YYMMDD
   * Record Count | 6 numbers, zero padded | 000201
   * RET-TAPE     | 1 character, Y or N    | Y
   * CERT-LABEL   | 1 character, Y or N    | N
   */

  output =
    'PKTA' +
    '    1' +
    sentDate.toString().slice(-6) +
    recordCountPadded +
    'Y' +
    (includeLabels ? 'Y' : 'N') +
    newline +
    output

  /*
   * FOOTER ROW
   * ----------
   * Record ID    | 4 characters           | "PKTZ"
   * Record Count | 6 numbers, zero padded | 000201
   */

  output += 'PKTZ' + recordCountPadded + newline

  return output
}

export function exportLicencePlateBatch(
  batchID: number,
  requestSession: expressSession.Session
): string {
  markLookupBatchAsSent(batchID, requestSession)

  const batch = getLookupBatch(batchID)

  return exportBatch(
    batch.sentDate as number,
    batch.mto_includeLabels as boolean,
    batch.batchEntries
  )
}

/**
 * @deprecated
 */
export const exportConvictionBatch = (
  batchID: number,
  requestSession: expressSession.Session
): string => {
  markConvictionBatchAsSent(batchID, requestSession)

  const batch = getConvictionBatch(batchID)

  return exportBatch(
    batch?.sentDate as number,
    true,
    batch?.batchEntries as ParkingTicketStatusLog[]
  )
}
