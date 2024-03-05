import type { RequestHandler } from 'express'

import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batch = getConvictionBatch(request.body.batchId)

  return response.json(batch)
}

export default handler
