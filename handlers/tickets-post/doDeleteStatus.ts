import type { RequestHandler } from 'express'

import { deleteParkingTicketStatus } from '../../database/parkingDB/deleteParkingTicketStatus.js'

export const handler: RequestHandler = (request, response) => {
  const result = deleteParkingTicketStatus(
    request.body.ticketId,
    request.body.statusIndex,
    request.session.user as PTSUser
  )

  return response.json(result)
}

export default handler
