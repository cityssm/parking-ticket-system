import type { Request, Response } from 'express'

import deleteParkingTicketRemark from '../../database/parkingDB/deleteParkingTicketRemark.js'

export default function handler(request: Request, response: Response): void {
  const result = deleteParkingTicketRemark(
    Number.parseInt(request.body.ticketId as string, 10),
    Number.parseInt(request.body.remarkIndex as string, 10),
    request.session.user as PTSUser
  )

  response.json(result)
}
