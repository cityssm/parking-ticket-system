import type { Request, Response } from 'express'

import deleteParkingTicketStatus from '../../database/parkingDB/deleteParkingTicketStatus.js'

export default function handler(request: Request, response: Response): void {
  const result = deleteParkingTicketStatus(
    Number.parseInt(request.body.ticketId as string, 10),
    Number.parseInt(request.body.statusIndex as string, 10),
    request.session.user as PTSUser
  )

  response.json(result)
}
