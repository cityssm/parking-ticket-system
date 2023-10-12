import type { RequestHandler } from 'express'

import { getLastTenConvictionBatches } from '../../database/parkingDB/getLastTenConvictionBatches.js'

export const handler: RequestHandler = (_request, response) => {
  const batches = getLastTenConvictionBatches()

  return response.json(batches)
}

export default handler
