import type { Request, Response } from 'express'

import createConvictionBatch from '../../database/parkingDB/createConvictionBatch.js'

export default function handler(request: Request, response: Response): void {
  const batchResult = createConvictionBatch(request.session.user as PTSUser)

  response.json(batchResult)
}
