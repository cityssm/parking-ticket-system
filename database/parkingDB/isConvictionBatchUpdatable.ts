import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export function isConvictionBatchUpdatable(
  batchID: number,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(databasePath)

  const lockDate = database
    .prepare(
      `select lockDate
        from ParkingTicketConvictionBatches
        where recordDelete_timeMillis is null
        and batchID = ?`
    )
    .pluck()
    .get(batchID) as number | undefined | null

  if (connectedDatabase === undefined) {
    database.close()
  }

  return lockDate === null
}

export default isConvictionBatchUpdatable
