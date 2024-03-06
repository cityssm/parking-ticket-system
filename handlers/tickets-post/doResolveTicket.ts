import type { Request, Response } from 'express'

import resolveParkingTicket from '../../database/parkingDB/resolveParkingTicket.js'

export default function handler(request: Request, response: Response): void {
  const result = resolveParkingTicket(
    Number.parseInt(request.body.ticketId as string, 10),
    request.session.user as PTSUser
  )

  response.json(result)
}
