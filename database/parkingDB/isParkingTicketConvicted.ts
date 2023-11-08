import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export function isParkingTicketConvicted(
  ticketId: number,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(databasePath)

  const statusIndex = database
    .prepare(
      `select statusIndex
        from ParkingTicketStatusLog
        where recordDelete_timeMillis is null
        and ticketId = ?
        and statusKey = 'convicted'`
    )
    .pluck()
    .get(ticketId) as number | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return statusIndex !== undefined
}

export default isParkingTicketConvicted
