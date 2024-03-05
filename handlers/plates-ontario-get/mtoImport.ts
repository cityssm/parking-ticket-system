import type { Request, Response } from 'express'

import getUnreceivedLookupBatches from '../../database/parkingDB/getUnreceivedLookupBatches.js'

export default function handler(_request: Request, response: Response): void {
  const unreceivedBatches = getUnreceivedLookupBatches(false)

  response.render('mto-plateImport', {
    headTitle: 'MTO Licence Plate Ownership Import',
    batches: unreceivedBatches
  })
}
