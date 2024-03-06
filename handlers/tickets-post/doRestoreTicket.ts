import type { Request, Response } from 'express'

import restoreParkingTicket from '../../database/parkingDB/restoreParkingTicket.js'

export default function handler(request: Request, response: Response): void {
  const result = restoreParkingTicket(
    Number.parseInt(request.body.ticketId as string, 10),
    request.session.user as PTSUser
  )

  response.json(result)
}
