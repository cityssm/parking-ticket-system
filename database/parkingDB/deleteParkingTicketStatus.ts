import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export function deleteParkingTicketStatus(
  ticketId: number,
  statusIndex: number,
  sessionUser: PTSUser
): { success: boolean } {
  const database = sqlite(databasePath)

  const info = database
    .prepare(
      `update ParkingTicketStatusLog
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where ticketId = ?
        and statusIndex = ?
        and recordDelete_timeMillis is null`
    )
    .run(sessionUser.userName, Date.now(), ticketId, statusIndex)

  database.close()

  return {
    success: info.changes > 0
  }
}

export default deleteParkingTicketStatus
