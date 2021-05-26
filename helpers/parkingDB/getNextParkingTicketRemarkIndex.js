export const getNextParkingTicketRemarkIndex = (db, ticketID) => {
    const remarkIndexNew = db.prepare("select ifnull(max(remarkIndex), 0) as remarkIndexMax" +
        " from ParkingTicketRemarks" +
        " where ticketID = ?")
        .get(ticketID)
        .remarkIndexMax + 1;
    return remarkIndexNew;
};
export default getNextParkingTicketRemarkIndex;
