import type { RequestHandler } from 'express'

import { lockConvictionBatch } from '../../database/parkingDB/lockConvictionBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batchID = request.body.batchID

  const result = lockConvictionBatch(batchID, request.session.user as PTSUser)

  return response.json(result)
}

export default handler
