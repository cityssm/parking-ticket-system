export default function getNextParkingTicketStatusIndex(ticketId, database) {
    return (database
        .prepare(`select ifnull(max(statusIndex), 0) as statusIndexMax
          from ParkingTicketStatusLog
          where ticketId = ?`)
        .pluck()
        .get(ticketId) + 1);
}
