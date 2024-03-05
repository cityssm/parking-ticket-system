import type { Request, Response } from 'express'

import getLookupBatch from '../../database/parkingDB/getLookupBatch.js'
import lockLookupBatch from '../../database/parkingDB/lockLookupBatch.js'

export default function handler(request: Request, response: Response): void {
  const batchId = Number.parseInt(request.body.batchId as string, 10)

  const result = lockLookupBatch(batchId, request.session.user as PTSUser)

  if (result.success) {
    result.batch = getLookupBatch(batchId)
  }

  response.json(result)
}
