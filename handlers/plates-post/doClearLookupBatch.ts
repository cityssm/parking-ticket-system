import type { RequestHandler } from 'express'

import { clearLookupBatch } from '../../database/parkingDB/clearLookupBatch.js'
import getLookupBatch from '../../database/parkingDB/getLookupBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = Number.parseInt(request.body.batchId, 10)

  const result = clearLookupBatch(batchId, request.session.user as PTSUser)

  if (result.success) {
    result.batch = getLookupBatch(batchId)
  }

  return response.json(result)
}

export default handler
