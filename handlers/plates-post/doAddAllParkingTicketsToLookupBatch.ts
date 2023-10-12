import type { RequestHandler } from 'express'

import { addAllParkingTicketsToLookupBatch } from '../../database/parkingDB/addLicencePlateToLookupBatch.js'

export const handler: RequestHandler = (request, response) => {
  const result = addAllParkingTicketsToLookupBatch(
    request.body,
    request.session
  )

  return response.json(result)
}

export default handler
