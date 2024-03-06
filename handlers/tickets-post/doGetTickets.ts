import type { Request, Response } from 'express'

import getParkingTickets, {
  type GetParkingTicketsQueryOptions
} from '../../database/parkingDB/getParkingTickets.js'

export default function handler(request: Request, response: Response): void {
  const queryOptions: GetParkingTicketsQueryOptions = {
    limit: Number.parseInt(request.body.limit as string, 10),
    offset: Number.parseInt(request.body.offset as string, 10),
    ticketNumber: request.body.ticketNumber,
    licencePlateNumber: request.body.licencePlateNumber,
    location: request.body.location
  }

  if (request.body.isResolved !== '') {
    queryOptions.isResolved = request.body.isResolved === '1'
  }

  response.json(
    getParkingTickets(request.session.user as PTSUser, queryOptions)
  )
}
