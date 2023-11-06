import type * as sqlite from 'better-sqlite3'

export const getNextParkingTicketRemarkIndex = (
  ticketID: number,
  database: sqlite.Database
): number => {
  return (
    (database
      .prepare(
        `select ifnull(max(remarkIndex), 0) as remarkIndexMax
          from ParkingTicketRemarks
          where ticketID = ?`
      )
      .pluck()
      .get(ticketID) as number) + 1
  )
}

export default getNextParkingTicketRemarkIndex
