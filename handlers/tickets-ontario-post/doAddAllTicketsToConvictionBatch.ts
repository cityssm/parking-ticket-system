import type { Request, Response } from 'express'

import { addAllParkingTicketsToConvictionBatch } from '../../database/parkingDB/addParkingTicketToConvictionBatch.js'
import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js'
import { getParkingTicketsAvailableForMTOConvictionBatch } from '../../database/parkingDB-ontario.js'
import type {
  ParkingTicket,
  ParkingTicketConvictionBatch
} from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const batchId = Number.parseInt(request.body.batchId as string, 10)
  const ticketIds: number[] = request.body.ticketIds

  const result = addAllParkingTicketsToConvictionBatch(
    batchId,
    ticketIds,
    request.session.user as PTSUser
  ) as {
    success: boolean
    successCount: number
    message?: string
    batch?: ParkingTicketConvictionBatch
    tickets?: ParkingTicket[]
  }

  if (result.successCount > 0) {
    result.batch = getConvictionBatch(batchId)
    result.tickets = getParkingTicketsAvailableForMTOConvictionBatch()
  }

  response.json(result)
}
