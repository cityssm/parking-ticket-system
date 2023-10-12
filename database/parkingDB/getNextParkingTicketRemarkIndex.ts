import type * as sqlite from 'better-sqlite3'

export const getNextParkingTicketRemarkIndex = (
  database: sqlite.Database,
  ticketID: number
): number => {
  const remarkIndexNew =
    (
      database
        .prepare(
          'select ifnull(max(remarkIndex), 0) as remarkIndexMax' +
            ' from ParkingTicketRemarks' +
            ' where ticketID = ?'
        )
        .get(ticketID) as { remarkIndexMax: number }
    ).remarkIndexMax + 1

  return remarkIndexNew
}

export default getNextParkingTicketRemarkIndex
