import type { RequestHandler } from 'express'

import { removeParkingTicketFromConvictionBatch } from '../../database/parkingDB/removeParkingTicketFromConvictionBatch.js'
import * as parkingDB_ontario from '../../database/parkingDB-ontario.js'
import type { ParkingTicket } from '../../types/recordTypes.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = request.body.batchId
  const ticketId = request.body.ticketId

  const result: {
    success: boolean
    message?: string
    tickets?: ParkingTicket[]
  } = removeParkingTicketFromConvictionBatch(
    batchId,
    ticketId,
    request.session.user as PTSUser
  )

  if (result.success) {
    result.tickets =
      parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch()
  }

  return response.json(result)
}

export default handler
