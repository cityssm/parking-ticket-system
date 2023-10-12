import type { RequestHandler } from 'express'

import { restoreParkingTicket } from '../../database/parkingDB/restoreParkingTicket.js'

export const handler: RequestHandler = (request, response) => {
  const result = restoreParkingTicket(request.body.ticketID, request.session)

  return response.json(result)
}

export default handler
