export const getNextParkingTicketStatusIndex = (database, ticketID) => {
    return (database
        .prepare('select ifnull(max(statusIndex), 0) as statusIndexMax' +
        ' from ParkingTicketStatusLog' +
        ' where ticketID = ?')
        .get(ticketID).statusIndexMax + 1);
};
export default getNextParkingTicketStatusIndex;
