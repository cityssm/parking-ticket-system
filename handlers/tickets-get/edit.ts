import { dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getParkingTicket from '../../database/parkingDB/getParkingTicket.js'
import { getRecentParkingTicketVehicleMakeModelValues } from '../../database/parkingDB.js'
import { getConfigProperty } from '../../helpers/functions.config.js'

const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')

export interface TicketsEditParameters {
  ticketId: `${number}`
}

export default async function handler(
  request: Request<TicketsEditParameters>,
  response: Response
): Promise<void> {
  const ticketId = Number.parseInt(request.params.ticketId, 10)

  const ticket = await getParkingTicket(
    ticketId,
    request.session.user as PTSUser
  )

  if (!ticket) {
    response.redirect(`${urlPrefix}/tickets/?error=ticketNotFound`)
    return
  } else if (
    !ticket.canUpdate ||
    ticket.resolvedDate ||
    ticket.recordDelete_timeMillis
  ) {
    response.redirect(
      `${urlPrefix}/tickets/${ticketId.toString()}/?error=accessDenied`
    )
    return
  }

  const vehicleMakeModelDatalist =
    getRecentParkingTicketVehicleMakeModelValues()

  response.render('ticket-edit', {
    headTitle: `Ticket ${ticket.ticketNumber}`,
    isCreate: false,
    ticket,
    issueDateMaxString: dateToString(new Date()),
    vehicleMakeModelDatalist
  })
}
