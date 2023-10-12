import type { RequestHandler } from 'express'

import * as parkingDB_ontario from '../../database/parkingDB-ontario.js'

import { clearConvictionBatch } from '../../database/parkingDB/clearConvictionBatch.js'
import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js'

import type * as pts from '../../types/recordTypes'

export const handler: RequestHandler = (request, response) => {
  const batchID = request.body.batchID

  const result: {
    success: boolean
    message?: string
    batch?: pts.ParkingTicketConvictionBatch
    tickets?: pts.ParkingTicket[]
  } = clearConvictionBatch(batchID, request.session)

  if (result.success) {
    result.batch = getConvictionBatch(batchID)
    result.tickets =
      parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch()
  }

  return response.json(result)
}

export default handler
