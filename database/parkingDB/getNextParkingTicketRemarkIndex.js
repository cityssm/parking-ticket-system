export const getNextParkingTicketRemarkIndex = (ticketID, database) => {
    return (database
        .prepare(`select ifnull(max(remarkIndex), 0) as remarkIndexMax
          from ParkingTicketRemarks
          where ticketID = ?`)
        .pluck()
        .get(ticketID) + 1);
};
export default getNextParkingTicketRemarkIndex;
