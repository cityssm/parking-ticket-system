import type { RequestHandler } from 'express'

import { addParkingTicketToConvictionBatch } from '../../database/parkingDB/addParkingTicketToConvictionBatch.js'
import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js'
import type { ParkingTicketConvictionBatch } from '../../types/recordTypes.js'

export const handler: RequestHandler = (request, response) => {
  const batchID = request.body.batchID
  const ticketID = request.body.ticketID

  const result: {
    success: boolean
    message?: string
    batch?: ParkingTicketConvictionBatch
  } = addParkingTicketToConvictionBatch(
    batchID,
    ticketID,
    request.session.user as PTSUser
  )

  if (result.success) {
    result.batch = getConvictionBatch(batchID)
  }

  return response.json(result)
}

export default handler
