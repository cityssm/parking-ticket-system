import type { Request, Response } from 'express'

import createParkingTicket from '../../database/parkingDB/createParkingTicket.js'
import { getConfigProperty } from '../../helpers/functions.config.js'
import type { ParkingTicket } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const result = createParkingTicket(
    request.body as ParkingTicket,
    request.session.user as PTSUser
  )

  if (result.success) {
    const ticketNumber = request.body.ticketNumber as string
    result.nextTicketNumber = getConfigProperty(
      'parkingTickets.ticketNumber.nextTicketNumberFn'
    )(ticketNumber)
  }

  response.json(result)
}
