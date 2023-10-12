import type { RequestHandler } from 'express'

import { createParkingTicketRemark } from '../../database/parkingDB/createParkingTicketRemark.js'

export const handler: RequestHandler = (request, response) => {
  const result = createParkingTicketRemark(request.body, request.session)

  return response.json(result)
}

export default handler
