import type { Request, Response } from 'express'

import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js'
import markConvictionBatchAsSent from '../../database/parkingDB/markConvictionBatchAsSent.js'

export default function handler(request: Request, response: Response): void {
  const batchId = Number.parseInt(request.body.batchId as string, 10)

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
