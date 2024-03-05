import type { RequestHandler } from 'express'

import { updateParkingTicketRemark } from '../../database/parkingDB/updateParkingTicketRemark.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'

export const handler: RequestHandler = (request, response) => {
  const result = updateParkingTicketRemark(
    request.body as ParkingTicketRemark,
    request.session.user as PTSUser
  )

  return response.json(result)
}

export default handler
