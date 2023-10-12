import type { RequestHandler } from 'express'

import { resolveParkingTicket } from '../../database/parkingDB/resolveParkingTicket.js'

export const handler: RequestHandler = (request, response) => {
  const result = resolveParkingTicket(request.body.ticketID, request.session)

  return response.json(result)
}

export default handler
