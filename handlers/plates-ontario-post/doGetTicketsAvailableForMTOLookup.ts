import type { Request, Response } from 'express'

import getParkingTicketsAvailableForMTOLookup from '../../database/parkingDB-ontario/getParkingTicketsAvailableForMTOLookup.js'

export default function handler(request: Request, response: Response): void {
  const batchId = Number.parseInt(request.body.batchId as string, 10)
  const issueDaysAgo = Number.parseInt(request.body.issueDaysAgo as string, 10)

  const tickets = getParkingTicketsAvailableForMTOLookup(batchId, issueDaysAgo)

  response.json({
    tickets
  })
}
