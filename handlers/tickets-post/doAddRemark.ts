import type { Request, Response } from 'express'

import createParkingTicketRemark from '../../database/parkingDB/createParkingTicketRemark.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const result = createParkingTicketRemark(
    request.body as ParkingTicketRemark,
    request.session.user as PTSUser
  )

  response.json(result)
}
