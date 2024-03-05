import type { Request, Response } from 'express'

import {
  type AddAllParkingTicketsToLookupBatchBody,
  addAllParkingTicketsToLookupBatch
} from '../../database/parkingDB/addLicencePlateToLookupBatch.js'

export default function handler(request: Request, response: Response): void {
  const result = addAllParkingTicketsToLookupBatch(
    request.body as AddAllParkingTicketsToLookupBatchBody,
    request.session.user as PTSUser
  )

  response.json(result)
}
