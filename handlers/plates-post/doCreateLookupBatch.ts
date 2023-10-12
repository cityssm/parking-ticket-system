import type { RequestHandler } from 'express'

import { createLookupBatch } from '../../database/parkingDB/createLookupBatch.js'

export const handler: RequestHandler = (request, response) => {
  const createBatchResponse = createLookupBatch(request.body, request.session)

  return response.json(createBatchResponse)
}

export default handler
