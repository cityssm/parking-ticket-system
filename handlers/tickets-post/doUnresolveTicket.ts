import type { Request, Response } from 'express'

import unresolveParkingTicket from '../../database/parkingDB/unresolveParkingTicket.js'

export default function handler(request: Request, response: Response): void {
  const result = unresolveParkingTicket(
    Number.parseInt(request.body.ticketId as string, 10),
    request.session.user as PTSUser
  )

  response.json(result)
}
