import type { Request, Response } from 'express'

import { addParkingTicketToConvictionBatch } from '../../database/parkingDB/addParkingTicketToConvictionBatch.js'
import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js'
import type { ParkingTicketConvictionBatch } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const batchId = Number.parseInt(request.body.batchId as string, 10)
  const ticketId = Number.parseInt(request.body.ticketId as string, 10)

  const result: {
    success: boolean
    message?: string
    batch?: ParkingTicketConvictionBatch
  } = addParkingTicketToConvictionBatch(
    batchId,
    ticketId,
    request.session.user as PTSUser
  )

  if (result.success) {
    result.batch = getConvictionBatch(batchId)
  }

  response.json(result)
}
