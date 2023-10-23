import type { RequestHandler } from 'express'

import { unlockConvictionBatch } from '../../database/parkingDB/unlockConvictionBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batchID = request.body.batchID

  const success = unlockConvictionBatch(batchID, request.session.user as PTSUser)

  return response.json({ success })
}

export default handler
