import type { RequestHandler } from 'express'

import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js'
import { markConvictionBatchAsSent } from '../../database/parkingDB/markConvictionBatchAsSent.js'

export const handler: RequestHandler = (request, response) => {
  const batchID = request.body.batchID

  const success = markConvictionBatchAsSent(
    batchID,
    request.session.user as PTSUser
  )

  const batch = getConvictionBatch(batchID)

  response.json({
    success,
    batch
  })
}

export default handler
