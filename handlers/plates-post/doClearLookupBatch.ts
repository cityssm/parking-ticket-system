import type { RequestHandler } from 'express'

import { clearLookupBatch } from '../../database/parkingDB/clearLookupBatch.js'
import { getLookupBatch } from '../../database/parkingDB/getLookupBatch.js'

export const handler: RequestHandler = (request, response) => {
  const batchID = Number.parseInt(request.body.batchID, 10)

  const result = clearLookupBatch(batchID, request.session.user as PTSUser)

  if (result.success) {
    result.batch = getLookupBatch(batchID)
  }

  return response.json(result)
}

export default handler
