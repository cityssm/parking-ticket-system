import type { Request, Response } from 'express'

import getParkingTicketRemarks from '../../database/parkingDB/getParkingTicketRemarks.js'

export default function handler(request: Request, response: Response): void {
  response.json(
    getParkingTicketRemarks(
      Number.parseInt(request.body.ticketId as string, 10),
      request.session.user as PTSUser
    )
  )
}
