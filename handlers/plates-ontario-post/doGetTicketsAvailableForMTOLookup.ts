import type { RequestHandler } from 'express'

import { getParkingTicketsAvailableForMTOLookup } from '../../database/parkingDB-ontario/getParkingTicketsAvailableForMTOLookup.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = Number.parseInt(request.body.batchId, 10)
  const issueDaysAgo = Number.parseInt(request.body.issueDaysAgo, 10)

  const tickets = getParkingTicketsAvailableForMTOLookup(batchId, issueDaysAgo)

  return response.json({
    tickets
  })
}

export default handler
