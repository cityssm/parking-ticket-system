import type { Request, Response } from 'express'

import updateParkingTicketRemark from '../../database/parkingDB/updateParkingTicketRemark.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const result = updateParkingTicketRemark(
    request.body as ParkingTicketRemark,
    request.session.user as PTSUser
  )

  response.json(result)
}
