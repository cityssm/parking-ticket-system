import type { Request, Response } from 'express'

import getOwnershipReconciliationRecords from '../../database/parkingDB/getOwnershipReconciliationRecords.js'
import getUnacknowledgedLookupErrorLog from '../../database/parkingDB/getUnacknowledgedLookupErrorLog.js'

export default async function handler(_request: Request, response: Response): Promise<void> {
  const reconciliationRecords = await getOwnershipReconciliationRecords()

  const lookupErrors = getUnacknowledgedLookupErrorLog(-1, -1)

  response.render('ticket-reconcile', {
    headTitle: 'Ownership Reconciliation',
    records: reconciliationRecords,
    errorLog: lookupErrors
  })
}
