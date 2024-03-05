import type { Request, Response } from 'express'

import getLookupBatch from '../../database/parkingDB/getLookupBatch.js'

export default function handler(_request: Request, response: Response): void {
  const latestUnlockedBatch = getLookupBatch(-1)

  response.render('mto-plateExport', {
    headTitle: 'MTO Licence Plate Export',
    batch: latestUnlockedBatch
  })
}
