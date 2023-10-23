import type { RequestHandler } from 'express'

import { createConvictionBatch } from '../../database/parkingDB/createConvictionBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batchResult = createConvictionBatch(request.session.user as PTSUser)

  return response.json(batchResult)
}

export default handler
