import type { Request, Response } from 'express'

import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js'

export default function handler(request: Request, response: Response): void {
  const batch = getConvictionBatch(
    Number.parseInt(request.body.batchId as string, 10)
  )

  response.json(batch)
}
