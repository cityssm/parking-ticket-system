import type { RequestHandler } from 'express'

import { updateParkingTicketRemark } from '../../database/parkingDB/updateParkingTicketRemark.js'

export const handler: RequestHandler = (request, response) => {
  const result = updateParkingTicketRemark(request.body, request.session)

  return response.json(result)
}

export default handler
