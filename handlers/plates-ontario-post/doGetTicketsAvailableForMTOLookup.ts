import type { RequestHandler } from 'express'

import { getParkingTicketsAvailableForMTOLookup } from '../../database/parkingDB-ontario/getParkingTicketsAvailableForMTOLookup.js'

export const handler: RequestHandler = (request, response) => {
  const batchID = Number.parseInt(request.body.batchID, 10)
  const issueDaysAgo = Number.parseInt(request.body.issueDaysAgo, 10)

  const tickets = getParkingTicketsAvailableForMTOLookup(batchID, issueDaysAgo)

  return response.json({
    tickets
  })
}

export default handler
