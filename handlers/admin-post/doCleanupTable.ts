import type { RequestHandler } from 'express'

import { cleanupLicencePlateOwnersTable } from '../../database/parkingDB/cleanupLicencePlateOwnersTable.js'
import { cleanupParkingBylawsTable } from '../../database/parkingDB/cleanupParkingBylawsTable.js'
import { cleanupParkingLocationsTable } from '../../database/parkingDB/cleanupParkingLocationsTable.js'
import { cleanupParkingOffencesTable } from '../../database/parkingDB/cleanupParkingOffencesTable.js'
import { cleanupParkingTicketRemarksTable } from '../../database/parkingDB/cleanupParkingTicketRemarksTable.js'
import { cleanupParkingTicketStatusLog } from '../../database/parkingDB/cleanupParkingTicketStatusLog.js'
import { cleanupParkingTicketsTable } from '../../database/parkingDB/cleanupParkingTicketsTable.js'
import { getConfigProperty } from '../../helpers/functions.config.js'

export const handler: RequestHandler = (request, response) => {
  const table = request.body.table

  const recordDeleteTimeMillis = Math.min(
    Number.parseInt(request.body.recordDelete_timeMillis, 10),
    Date.now() - getConfigProperty('databaseCleanup.windowDays') * 86_400 * 1000
  )

  let success = false

  switch (table) {
    case 'parkingTickets': {
      success = cleanupParkingTicketsTable(recordDeleteTimeMillis)
      break
    }

    case 'parkingTicketRemarks': {
      success = cleanupParkingTicketRemarksTable(recordDeleteTimeMillis)
      break
    }

    case 'parkingTicketStatusLog': {
      success = cleanupParkingTicketStatusLog(recordDeleteTimeMillis)
      break
    }

    case 'licencePlateOwners': {
      success = cleanupLicencePlateOwnersTable(recordDeleteTimeMillis)
      break
    }

    case 'parkingOffences': {
      success = cleanupParkingOffencesTable()
      break
    }

    case 'parkingLocations': {
      success = cleanupParkingLocationsTable()
      break
    }

    case 'parkingBylaws': {
      success = cleanupParkingBylawsTable()
      break
    }
  }

  return response.json({ success })
}

export default handler
