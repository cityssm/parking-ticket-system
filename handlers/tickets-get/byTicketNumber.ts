import type { Request, Response } from 'express'

import getParkingTicketId from '../../database/parkingDB/getParkingTicketId.js'
import { getConfigProperty } from '../../helpers/functions.config.js'

const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')

export interface TicketsByTicketNumberParameters {
  ticketNumber: string
}

export default function handler(
  request: Request<TicketsByTicketNumberParameters>,
  response: Response
): void {
  const ticketNumber = request.params.ticketNumber

  const ticketId = getParkingTicketId(ticketNumber)

  if (ticketId === undefined) {
    response.redirect(`${urlPrefix}/tickets/?error=ticketNotFound`)
  } else {
    response.redirect(`${urlPrefix}/tickets/${ticketId.toString()}`)
  }
}
