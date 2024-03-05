import type { Request, Response } from 'express'

import removeParkingTicketFromConvictionBatch from '../../database/parkingDB/removeParkingTicketFromConvictionBatch.js'
import { getParkingTicketsAvailableForMTOConvictionBatch } from '../../database/parkingDB-ontario.js'
import type { ParkingTicket } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
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
    result.tickets = getParkingTicketsAvailableForMTOConvictionBatch()
  }

  response.json(result)
}
