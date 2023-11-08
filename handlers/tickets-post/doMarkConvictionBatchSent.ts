import type { RequestHandler } from 'express'

import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js'
import { markConvictionBatchAsSent } from '../../database/parkingDB/markConvictionBatchAsSent.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = request.body.batchId

  const success = markConvictionBatchAsSent(
    batchId,
    request.session.user as PTSUser
  )

  const batch = getConvictionBatch(batchId)

  response.json({
    success,
    batch
  })
}

export default handler
