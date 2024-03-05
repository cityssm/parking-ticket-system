import type { Request, Response } from 'express'

import createLookupBatch, {
  type CreateLookupBatchForm
} from '../../database/parkingDB/createLookupBatch.js'

export default function handler(request: Request, response: Response): void {
  const createBatchResponse = createLookupBatch(
    request.body as CreateLookupBatchForm,
    request.session.user as PTSUser
  )

  response.json(createBatchResponse)
}
