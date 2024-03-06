import type sqlite from 'better-sqlite3'

export default function getNextParkingTicketRemarkIndex(ticketId: number,
  database: sqlite.Database): number {
  return (
    (database
      .prepare(
        `select ifnull(max(remarkIndex), 0) as remarkIndexMax
          from ParkingTicketRemarks
          where ticketId = ?`
      )
      .pluck()
      .get(ticketId) as number) + 1
  )
}
