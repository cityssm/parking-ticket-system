import type { RequestHandler } from 'express'

import {
  type AddAllParkingTicketsToLookupBatchBody,
  addAllParkingTicketsToLookupBatch
} from '../../database/parkingDB/addLicencePlateToLookupBatch.js'

export const handler: RequestHandler = (request, response) => {
  const result = addAllParkingTicketsToLookupBatch(
    request.body as AddAllParkingTicketsToLookupBatchBody,
    request.session.user as PTSUser
  )

  return response.json(result)
}

export default handler
