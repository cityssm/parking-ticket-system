import type { Request, Response } from 'express'

import getParkingTickets, {
  type GetParkingTicketsQueryOptions,
  type GetParkingTicketsReturn
} from '../../database/parkingDB/getParkingTickets.js'

interface DoGetTicketsBody {
  isResolved: '' | '0' | '1'
  licencePlateNumber: string
  limit: `${number}`
  location: string
  offset: `${number}`
  ticketNumber: string
}

export type DoGetTicketsResponse = GetParkingTicketsReturn

export default function handler(
  request: Request<unknown, unknown, DoGetTicketsBody>,
  response: Response<DoGetTicketsResponse>
): void {
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
