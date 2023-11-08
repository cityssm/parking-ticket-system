import type { RequestHandler } from 'express'

import { addLicencePlateToLookupBatch } from '../../database/parkingDB/addLicencePlateToLookupBatch.js'
import { getLookupBatch } from '../../database/parkingDB/getLookupBatch.js'

export const handler: RequestHandler = (request, response) => {
  const result = addLicencePlateToLookupBatch(request.body, request.session.user as PTSUser)

  if (result.success) {
    result.batch = getLookupBatch(request.body.batchId)
  }

  return response.json(result)
}

export default handler
