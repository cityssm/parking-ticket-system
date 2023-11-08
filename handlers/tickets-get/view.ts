import type { RequestHandler } from 'express'

import { getParkingTicket } from '../../database/parkingDB/getParkingTicket.js'

export const handler: RequestHandler = (request, response) => {
  const ticketId = Number.parseInt(request.params.ticketId, 10)

  const ticket = getParkingTicket(ticketId, request.session.user as PTSUser)

  if (!ticket) {
    response.redirect('/tickets/?error=ticketNotFound')
    return
  } else if (
    ticket.recordDelete_timeMillis &&
    !((request.session.user as PTSUser).isAdmin ?? false)
  ) {
    response.redirect('/tickets/?error=accessDenied')
    return
  }

  response.render('ticket-view', {
    headTitle: `Ticket ${ticket.ticketNumber}`,
    ticket
  })
}

export default handler
