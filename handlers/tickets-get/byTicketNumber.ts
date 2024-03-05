import type { Request, Response } from 'express'

import getParkingTicketId from '../../database/parkingDB/getParkingTicketId.js'

export default function handler(request: Request, response: Response): void {
  const ticketNumber = request.params.ticketNumber

  const ticketId = getParkingTicketId(ticketNumber)

  if (ticketId === undefined) {
    response.redirect('/tickets/?error=ticketNotFound')
  } else {
    response.redirect(`/tickets/${ticketId.toString()}`)
  }
}
