import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export default function resolveParkingTicket(
  ticketId: number | string,
  sessionUser: PTSUser,
  connectedDatabase?: sqlite.Database
): { success: boolean } {
  const database = connectedDatabase ?? sqlite(databasePath)

  const rightNow = new Date()

  const info = database
    .prepare(
      `update ParkingTickets
        set resolvedDate = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where ticketId = ?
        and resolvedDate is null
        and recordDelete_timeMillis is null`
    )
    .run(
      dateToInteger(rightNow),
      sessionUser.userName,
      rightNow.getTime(),
      ticketId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return {
    success: info.changes > 0
  }
}
