import type { RequestHandler } from 'express'

import { getUnreceivedLookupBatches } from '../../database/parkingDB/getUnreceivedLookupBatches.js'

export const handler: RequestHandler = (request, response) => {
  const batches = getUnreceivedLookupBatches(
    request.session.user.userProperties?.canUpdate ?? false
  )
  return response.json(batches)
}

export default handler
