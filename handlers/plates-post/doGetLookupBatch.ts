import type { RequestHandler } from 'express'

import { getLookupBatch } from '../../database/parkingDB/getLookupBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batch = getLookupBatch(request.body.batchId)

  response.json(batch)
}

export default handler
