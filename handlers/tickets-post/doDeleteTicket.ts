import type { Request, Response } from 'express'

import deleteParkingTicket from '../../database/parkingDB/deleteParkingTicket.js'

export default function handler(request: Request, response: Response): void {
  const result = deleteParkingTicket(
    Number.parseInt(request.body.ticketId as string, 10),
    request.session.user as PTSUser
  )

  response.json(result)
}
