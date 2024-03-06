import type { Request, Response } from 'express'

import lockConvictionBatch from '../../database/parkingDB/lockConvictionBatch.js'

export default function handler(request: Request, response: Response): void {
  const batchId = Number.parseInt(request.body.batchId as string, 10)

  const result = lockConvictionBatch(batchId, request.session.user as PTSUser)

  response.json(result)
}
