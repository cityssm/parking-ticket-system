import type { RequestHandler } from 'express'

import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js'
import { markConvictionBatchAsSent } from '../../database/parkingDB/markConvictionBatchAsSent.js'

export const handler: RequestHandler = (request, response) => {
  const batchId = Number.parseInt(request.params.batchId, 10)

  const batch = getConvictionBatch(batchId)

  if (batch !== undefined && batch.sentDate === undefined) {
    markConvictionBatchAsSent(batchId, request.session.user as PTSUser)
  }

  response.render('ticketConvict-print', {
    headTitle: 'Parking Tickets Conviction Batch',
    batch
  })
}

export default handler
