import type { Request, Response } from 'express'

import getLastTenConvictionBatches from '../../database/parkingDB/getLastTenConvictionBatches.js'

export default function handler(_request: Request, response: Response): void {
  const batches = getLastTenConvictionBatches()

  response.json(batches)
}
