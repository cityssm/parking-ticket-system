import type { Request, Response } from 'express'

import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js'
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const result = createParkingTicketStatus(
    request.body as Partial<ParkingTicketStatusLog>,
    request.session.user as PTSUser,
    request.body.resolveTicket === '1'
  )

  response.json(result)
}
