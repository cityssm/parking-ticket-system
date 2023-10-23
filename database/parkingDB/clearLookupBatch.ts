import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

import type { LookupBatchReturn } from './getLookupBatch.js'

export const clearLookupBatch = (
  batchID: number,
  sessionUser: PTSUser
): LookupBatchReturn => {
  const database = sqlite(databasePath)

  // Ensure batch is not locked

  const canUpdateBatch = database
    .prepare(
      `update LicencePlateLookupBatches
        set recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where batchID = ?
        and recordDelete_timeMillis is null
        and lockDate is null`
    )
    .run(sessionUser.userName, Date.now(), batchID).changes

  if (canUpdateBatch === 0) {
    database.close()

    return {
      success: false,
      message: 'Batch cannot be updated.'
    }
  }

  database
    .prepare('delete from LicencePlateLookupBatchEntries where batchID = ?')
    .run(batchID)

  database.close()

  return {
    success: true
  }
}

export default clearLookupBatch
