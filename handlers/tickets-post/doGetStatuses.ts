import type { Request, Response } from 'express'

import getParkingTicketStatuses from '../../database/parkingDB/getParkingTicketStatuses.js'

export default function handler(request: Request, response: Response): void {
  response.json(
    getParkingTicketStatuses(
      Number.parseInt(request.body.ticketId as string, 10),
      request.session.user as PTSUser
    )
  )
}
