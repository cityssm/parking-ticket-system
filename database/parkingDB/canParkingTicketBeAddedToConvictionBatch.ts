import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export const canParkingTicketBeAddedToConvictionBatch = (
  ticketId: number,
  connectedDatabase?: sqlite.Database
): boolean => {
  const database = connectedDatabase ?? sqlite(databasePath)

  const resolvedDate = database
    .prepare(
      `select resolvedDate from ParkingTickets
        where ticketId = ?
        and recordDelete_timeMillis is null`
    )
    .pluck()
    .get(ticketId) as number | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return (resolvedDate ?? undefined) === undefined
}

export default canParkingTicketBeAddedToConvictionBatch
