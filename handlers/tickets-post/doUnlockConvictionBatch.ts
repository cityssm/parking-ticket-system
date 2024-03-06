import type { Request, Response } from 'express'

import unlockConvictionBatch from '../../database/parkingDB/unlockConvictionBatch.js'

export default function handler(request: Request, response: Response): void {
  const batchId = Number.parseInt(request.body.batchId as string, 10)

  const success = unlockConvictionBatch(
    batchId,
    request.session.user as PTSUser
  )

  response.json({ success })
}
