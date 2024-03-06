import type sqlite from 'better-sqlite3'

export default function getNextParkingTicketStatusIndex(
  ticketId: number | string,
  database: sqlite.Database
): number {
  return (
    (database
      .prepare(
        `select ifnull(max(statusIndex), 0) as statusIndexMax
          from ParkingTicketStatusLog
          where ticketId = ?`
      )
      .pluck()
      .get(ticketId) as number) + 1
  )
}
