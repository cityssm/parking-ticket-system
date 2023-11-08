import type { RequestHandler } from 'express'

import { deleteParkingTicket } from '../../database/parkingDB/deleteParkingTicket.js'

export const handler: RequestHandler = (request, response) => {
  const result = deleteParkingTicket(
    request.body.ticketId,
    request.session.user as PTSUser
  )

  return response.json(result)
}

export default handler
