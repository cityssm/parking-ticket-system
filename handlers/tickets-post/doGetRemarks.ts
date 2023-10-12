import type { RequestHandler } from 'express'

import { getParkingTicketRemarks } from '../../database/parkingDB/getParkingTicketRemarks.js'

export const handler: RequestHandler = (request, response) => {
  return response.json(
    getParkingTicketRemarks(request.body.ticketID, request.session)
  )
}

export default handler
