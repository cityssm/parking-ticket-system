import type { RequestHandler } from 'express'

import { addParkingTicketToConvictionBatch } from '../../database/parkingDB/addParkingTicketToConvictionBatch.js'
import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js'
import type { ParkingTicketConvictionBatch } from '../../types/recordTypes.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = request.body.batchId
  const ticketId = request.body.ticketId

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

  return response.json(result)
}

export default handler
