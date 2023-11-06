export const getNextParkingTicketStatusIndex = (ticketID, database) => {
    return (database
        .prepare(`select ifnull(max(statusIndex), 0) as statusIndexMax
          from ParkingTicketStatusLog
          where ticketID = ?`)
        .pluck()
        .get(ticketID) + 1);
};
export default getNextParkingTicketStatusIndex;
