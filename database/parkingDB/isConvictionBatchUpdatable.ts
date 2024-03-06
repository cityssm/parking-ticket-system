import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export default function isConvictionBatchUpdatable(
  batchId: number,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(databasePath)

  const lockDate = database
    .prepare(
      `select lockDate
        from ParkingTicketConvictionBatches
        where recordDelete_timeMillis is null
        and batchId = ?`
    )
    .pluck()
    .get(batchId) as number | undefined | null

  if (connectedDatabase === undefined) {
    database.close()
  }

  return lockDate === null
}
