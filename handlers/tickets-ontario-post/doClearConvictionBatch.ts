import type { RequestHandler } from 'express'

import { clearConvictionBatch } from '../../database/parkingDB/clearConvictionBatch.js'
import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js'
import * as parkingDB_ontario from '../../database/parkingDB-ontario.js'
import type {
  ParkingTicket,
  ParkingTicketConvictionBatch
} from '../../types/recordTypes.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = request.body.batchId

  const result: {
    success: boolean
    message?: string
    batch?: ParkingTicketConvictionBatch
    tickets?: ParkingTicket[]
  } = clearConvictionBatch(batchId, request.session.user as PTSUser)

  if (result.success) {
    result.batch = getConvictionBatch(batchId)
    result.tickets =
      parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch()
  }

  return response.json(result)
}

export default handler
