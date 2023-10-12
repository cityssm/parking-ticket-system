import type { RequestHandler } from 'express'

import { getParkingTicketID } from '../../database/parkingDB/getParkingTicketID.js'

export const handler: RequestHandler = (request, response) => {
  const ticketNumber = request.params.ticketNumber

  const ticketID = getParkingTicketID(ticketNumber)

  if (ticketID) {
    response.redirect('/tickets/' + ticketID.toString())
  } else {
    response.redirect('/tickets/?error=ticketNotFound')
  }
}

export default handler
