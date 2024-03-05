import type { Request, Response } from 'express'

import getLookupBatch from '../../database/parkingDB/getLookupBatch.js'

export default function handler(request: Request, response: Response): void {
  const batch = getLookupBatch(
    Number.parseInt(request.body.batchId as string, 10)
  )

  response.json(batch)
}
