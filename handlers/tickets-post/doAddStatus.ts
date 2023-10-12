import type { RequestHandler } from 'express'

import { createParkingTicketStatus } from '../../database/parkingDB/createParkingTicketStatus.js'

export const handler: RequestHandler = (request, response) => {
  const result = createParkingTicketStatus(
    request.body,
    request.session,
    request.body.resolveTicket === '1'
  )

  return response.json(result)
}

export default handler
