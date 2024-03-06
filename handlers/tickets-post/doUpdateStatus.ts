import type { Request, Response } from 'express'

import updateParkingTicketStatus from '../../database/parkingDB/updateParkingTicketStatus.js'
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const result = updateParkingTicketStatus(
    request.body as ParkingTicketStatusLog,
    request.session.user as PTSUser
  )

  response.json(result)
}
