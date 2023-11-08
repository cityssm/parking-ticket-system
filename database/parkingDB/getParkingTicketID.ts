import sqlite from 'better-sqlite3'

import { parkingDB as databasePath } from '../../data/databasePaths.js'

export const getParkingTicketId = (
  ticketNumber: string
): number | undefined => {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const ticketId = database
    .prepare(
      `select ticketId
        from ParkingTickets
        where ticketNumber = ?
        and recordDelete_timeMillis is null
        order by ticketId desc
        limit 1`
    )
    .pluck()
    .get(ticketNumber) as number | undefined

  database.close()

  console.log(ticketId)

  return ticketId ?? undefined
}

export default getParkingTicketId
