import type { RequestHandler } from 'express'

import { addAllParkingTicketsToConvictionBatch } from '../../database/parkingDB/addParkingTicketToConvictionBatch.js'
import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js'
import * as parkingDB_ontario from '../../database/parkingDB-ontario.js'
import type {
  ParkingTicket,
  ParkingTicketConvictionBatch
} from '../../types/recordTypes.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = request.body.batchId
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
    result.tickets =
      parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch()
  }

  return response.json(result)
}

export default handler
