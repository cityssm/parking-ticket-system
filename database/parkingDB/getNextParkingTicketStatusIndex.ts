import type * as sqlite from 'better-sqlite3'

export const getNextParkingTicketStatusIndex = (
  ticketID: number | string,
  database: sqlite.Database
): number => {
  return (
    (database
      .prepare(
        `select ifnull(max(statusIndex), 0) as statusIndexMax
          from ParkingTicketStatusLog
          where ticketID = ?`
      )
      .pluck()
      .get(ticketID) as number) + 1
  )
}

export default getNextParkingTicketStatusIndex
