import type * as sqlite from 'better-sqlite3'

export const getNextParkingTicketStatusIndex = (
  database: sqlite.Database,
  ticketID: number | string
): number => {
  return (
    (
      database
        .prepare(
          'select ifnull(max(statusIndex), 0) as statusIndexMax' +
            ' from ParkingTicketStatusLog' +
            ' where ticketID = ?'
        )
        .get(ticketID) as { statusIndexMax: number }
    ).statusIndexMax + 1
  )
}

export default getNextParkingTicketStatusIndex
