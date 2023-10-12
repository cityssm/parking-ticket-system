import type { RequestHandler } from 'express'

import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js'
import { markConvictionBatchAsSent } from '../../database/parkingDB/markConvictionBatchAsSent.js'

export const handler: RequestHandler = (request, response) => {
  const batchID = Number.parseInt(request.params.batchID, 10)

  const batch = getConvictionBatch(batchID)

  if (batch !== undefined && batch.sentDate === undefined) {
    markConvictionBatchAsSent(batchID, request.session)
  }

  response.render('ticketConvict-print', {
    headTitle: 'Parking Tickets Conviction Batch',
    batch
  })
}

export default handler
