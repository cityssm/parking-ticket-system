import type { Request, Response } from 'express'

import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js'

export interface DoAddStatusBody {
  statusField: string
  statusField2: string
  statusKey: string
  statusNote: string
  ticketId: `${number}`
  resolveTicket?: '1'
}

export default function handler(
  request: Request<unknown, unknown, DoAddStatusBody>,
  response: Response
): void {
  const result = createParkingTicketStatus(
    request.body,
    request.session.user as PTSUser,
    request.body.resolveTicket === '1'
  )

  response.json(result)
}
