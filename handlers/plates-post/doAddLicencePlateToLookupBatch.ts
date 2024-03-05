import type { Request, Response } from 'express'

import { addLicencePlateToLookupBatch } from '../../database/parkingDB/addLicencePlateToLookupBatch.js'
import getLookupBatch from '../../database/parkingDB/getLookupBatch.js'
import type { LicencePlateLookupBatchEntry } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const result = addLicencePlateToLookupBatch(
    request.body as LicencePlateLookupBatchEntry,
    request.session.user as PTSUser
  )

  if (result.success) {
    result.batch = getLookupBatch(
      Number.parseInt(request.body.batchId as string, 10)
    )
  }

  response.json(result)
}
