import type { Request, Response } from 'express'

import updateParkingTicket from '../../database/parkingDB/updateParkingTicket.js'
import type { ParkingTicket } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const result = updateParkingTicket(
    request.body as ParkingTicket,
    request.session.user as PTSUser
  )

  response.json(result)
}
