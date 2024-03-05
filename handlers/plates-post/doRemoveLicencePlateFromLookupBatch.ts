import type { Request, Response } from 'express'

import { removeLicencePlateFromLookupBatch } from '../../database/parkingDB/removeLicencePlateFromLookupBatch.js'
import type { LicencePlateLookupBatchEntry } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const result = removeLicencePlateFromLookupBatch(
    request.body as LicencePlateLookupBatchEntry,
    request.session.user as PTSUser
  )

  response.json(result)
}
