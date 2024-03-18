import type { Request, Response } from 'express'

import getConvictionBatch from '../../database/parkingDB/getConvictionBatch.js'
import markConvictionBatchAsSent from '../../database/parkingDB/markConvictionBatchAsSent.js'

export interface TicketsConvictPrintParameters {
  batchId: `${number}`
}

export default function handler(
  request: Request<TicketsConvictPrintParameters>,
  response: Response
): void {
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
