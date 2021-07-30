export const canParkingTicketBeAddedToConvictionBatch = (database, ticketID) => {
    const check = database
        .prepare("select resolvedDate from ParkingTickets" +
        " where ticketID = ?" +
        " and recordDelete_timeMillis is null")
        .get(ticketID);
    if (!check || check.resolvedDate) {
        return false;
    }
    return true;
};
export default canParkingTicketBeAddedToConvictionBatch;
