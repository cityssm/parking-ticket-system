import type { RequestHandler } from 'express'

import { getParkingTicket } from '../../database/parkingDB/getParkingTicket.js'

export const handler: RequestHandler = (request, response) => {
  const ticketID = Number.parseInt(request.params.ticketID, 10)

  const ticket = getParkingTicket(ticketID, request.session.user as PTSUser)

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
    headTitle: 'Ticket ' + ticket.ticketNumber,
    ticket
  })
}

export default handler
