import type { RequestHandler } from 'express'

import { updateParkingTicket } from '../../database/parkingDB/updateParkingTicket.js'

export const handler: RequestHandler = (request, response) => {
  const result = updateParkingTicket(
    request.body,
    request.session.user as PTSUser
  )

  return response.json(result)
}

export default handler
