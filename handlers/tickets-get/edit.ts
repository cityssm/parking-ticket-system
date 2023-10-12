import type { RequestHandler } from 'express'

import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'

import { getParkingTicket } from '../../database/parkingDB/getParkingTicket.js'
import * as parkingDB from '../../database/parkingDB.js'

export const handler: RequestHandler = (request, response) => {
  const ticketID = Number.parseInt(request.params.ticketID, 10)

  const ticket = getParkingTicket(ticketID, request.session)

  if (!ticket) {
    return response.redirect('/tickets/?error=ticketNotFound')
  } else if (
    !ticket.canUpdate ||
    ticket.resolvedDate ||
    ticket.recordDelete_timeMillis
  ) {
    return response.redirect(
      '/tickets/' + ticketID.toString() + '/?error=accessDenied'
    )
  }

  const vehicleMakeModelDatalist =
    parkingDB.getRecentParkingTicketVehicleMakeModelValues()

  return response.render('ticket-edit', {
    headTitle: 'Ticket ' + ticket.ticketNumber,
    isCreate: false,
    ticket,
    issueDateMaxString: dateTimeFns.dateToString(new Date()),
    vehicleMakeModelDatalist
  })
}

export default handler
