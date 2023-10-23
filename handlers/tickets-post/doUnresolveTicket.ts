import type { RequestHandler } from 'express'

import { unresolveParkingTicket } from '../../database/parkingDB/unresolveParkingTicket.js'

export const handler: RequestHandler = (request, response) => {
  const result = unresolveParkingTicket(
    request.body.ticketID,
    request.session.user as PTSUser
  )

  return response.json(result)
}

export default handler
