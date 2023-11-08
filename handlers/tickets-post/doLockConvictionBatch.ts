import type { RequestHandler } from 'express'

import { lockConvictionBatch } from '../../database/parkingDB/lockConvictionBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = request.body.batchId

  const result = lockConvictionBatch(batchId, request.session.user as PTSUser)

  return response.json(result)
}

export default handler
