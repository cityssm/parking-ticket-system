import type { RequestHandler } from 'express'

import { getParkingTicketID } from '../../database/parkingDB/getParkingTicketID.js'

export const handler: RequestHandler = (request, response) => {
  const ticketNumber = request.params.ticketNumber

  const ticketID = getParkingTicketID(ticketNumber)

  if (ticketID === undefined) {
    response.redirect('/tickets/?error=ticketNotFound')
  } else {
    response.redirect(`/tickets/${ticketID.toString()}`)
  }
}

export default handler
