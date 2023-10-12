import type { RequestHandler } from 'express'

import * as configFunctions from '../../helpers/functions.config.js'

import { cleanupParkingTicketsTable } from '../../database/parkingDB/cleanupParkingTicketsTable.js'
import { cleanupParkingTicketRemarksTable } from '../../database/parkingDB/cleanupParkingTicketRemarksTable.js'
import { cleanupParkingTicketStatusLog } from '../../database/parkingDB/cleanupParkingTicketStatusLog.js'

import { cleanupLicencePlateOwnersTable } from '../../database/parkingDB/cleanupLicencePlateOwnersTable.js'

import { cleanupParkingBylawsTable } from '../../database/parkingDB/cleanupParkingBylawsTable.js'
import { cleanupParkingLocationsTable } from '../../database/parkingDB/cleanupParkingLocationsTable.js'
import { cleanupParkingOffencesTable } from '../../database/parkingDB/cleanupParkingOffencesTable.js'

export const handler: RequestHandler = (request, response) => {
  const table = request.body.table

  const recordDelete_timeMillis = Math.min(
    Number.parseInt(request.body.recordDelete_timeMillis, 10),
    Date.now() -
      configFunctions.getProperty('databaseCleanup.windowDays') * 86_400 * 1000
  )

  let success = false

  switch (table) {
    case 'parkingTickets':
      success = cleanupParkingTicketsTable(recordDelete_timeMillis)
      break

    case 'parkingTicketRemarks':
      success = cleanupParkingTicketRemarksTable(recordDelete_timeMillis)
      break

    case 'parkingTicketStatusLog':
      success = cleanupParkingTicketStatusLog(recordDelete_timeMillis)
      break

    case 'licencePlateOwners':
      success = cleanupLicencePlateOwnersTable(recordDelete_timeMillis)
      break

    case 'parkingOffences':
      success = cleanupParkingOffencesTable()
      break

    case 'parkingLocations':
      success = cleanupParkingLocationsTable()
      break

    case 'parkingBylaws':
      success = cleanupParkingBylawsTable()
      break
  }

  return response.json({ success })
}

export default handler
