import type { Request, Response } from 'express'

import getLicencePlates, {
  type GetLicencePlatesQueryOptions,
  type GetLicencePlatesReturn
} from '../../database/parkingDB/getLicencePlates.js'

export interface DoGetLicencePlatesBody {
  hasOwnerRecord: '' | '0' | '1'
  hasUnresolvedTickets: '' | '0' | '1'
  licencePlateNumber: string
  limit: `${number}`
  offset: `${number}`
}

export type DoGetLicencePlatesResponse = GetLicencePlatesReturn

export default function handler(
  request: Request<unknown, unknown, DoGetLicencePlatesBody>,
  response: Response<DoGetLicencePlatesResponse>
): void {
  const queryOptions: GetLicencePlatesQueryOptions = {
    limit: Number.parseInt(request.body.limit, 10),
    offset: Number.parseInt(request.body.offset, 10),
    licencePlateNumber: request.body.licencePlateNumber
  }

  if (request.body.hasOwnerRecord !== '') {
    queryOptions.hasOwnerRecord = request.body.hasOwnerRecord === '1'
  }

  if (request.body.hasUnresolvedTickets !== '') {
    queryOptions.hasUnresolvedTickets =
      request.body.hasUnresolvedTickets === '1'
  }

  response.json(getLicencePlates(queryOptions))
}
