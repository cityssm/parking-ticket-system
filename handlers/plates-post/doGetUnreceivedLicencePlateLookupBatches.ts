import type { Request, Response } from 'express'

import getUnreceivedLookupBatches from '../../database/parkingDB/getUnreceivedLookupBatches.js'

export default function handler(request: Request, response: Response): void {
  const batches = getUnreceivedLookupBatches(
    (request.session.user as PTSUser).canUpdate ?? false
  )

  response.json(batches)
}
