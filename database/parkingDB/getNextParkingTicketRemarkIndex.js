export default function getNextParkingTicketRemarkIndex(ticketId, database) {
    return (database
        .prepare(`select ifnull(max(remarkIndex), 0) as remarkIndexMax
          from ParkingTicketRemarks
          where ticketId = ?`)
        .pluck()
        .get(ticketId) + 1);
}
