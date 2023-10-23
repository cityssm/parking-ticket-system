import type { RequestHandler } from 'express'

import { getParkingTicketStatuses } from '../../database/parkingDB/getParkingTicketStatuses.js'

export const handler: RequestHandler = (request, response) => {
  return response.json(
    getParkingTicketStatuses(request.body.ticketID, request.session.user as PTSUser)
  )
}

export default handler
