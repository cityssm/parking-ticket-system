import type { RequestHandler } from 'express'

import { getLookupBatch } from '../../database/parkingDB/getLookupBatch.js'
import { lockLookupBatch } from '../../database/parkingDB/lockLookupBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = Number.parseInt(request.body.batchId, 10)

  const result = lockLookupBatch(batchId, request.session.user as PTSUser)

  if (result.success) {
    result.batch = getLookupBatch(batchId)
  }

  return response.json(result)
}

export default handler
