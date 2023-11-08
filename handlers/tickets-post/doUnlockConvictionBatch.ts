import type { RequestHandler } from 'express'

import { unlockConvictionBatch } from '../../database/parkingDB/unlockConvictionBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = request.body.batchId

  const success = unlockConvictionBatch(batchId, request.session.user as PTSUser)

  return response.json({ success })
}

export default handler
