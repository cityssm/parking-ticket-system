import type { Request, Response } from 'express'

import * as parkingDB_getLicencePlates from '../../database/parkingDB/getLicencePlates.js'

export default function handler(request: Request, response: Response): void {
  const queryOptions: parkingDB_getLicencePlates.GetLicencePlatesQueryOptions =
    {
      limit: Number.parseInt(request.body.limit as string, 10),
      offset: Number.parseInt(request.body.offset as string, 10),
      licencePlateNumber: request.body.licencePlateNumber
    }

  if (request.body.hasOwnerRecord !== '') {
    queryOptions.hasOwnerRecord = request.body.hasOwnerRecord === '1'
  }

  if (request.body.hasUnresolvedTickets !== '') {
    queryOptions.hasUnresolvedTickets =
      request.body.hasUnresolvedTickets === '1'
  }

  response.json(parkingDB_getLicencePlates.getLicencePlates(queryOptions))
}
