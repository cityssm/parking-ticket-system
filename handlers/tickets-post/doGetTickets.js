import * as parkingDB_getParkingTickets from '../../database/parkingDB/getParkingTickets.js';
export const handler = (request, response) => {
    const queryOptions = {
        limit: Number.parseInt(request.body.limit, 10),
        offset: Number.parseInt(request.body.offset, 10),
        ticketNumber: request.body.ticketNumber,
        licencePlateNumber: request.body.licencePlateNumber,
        location: request.body.location
    };
    if (request.body.isResolved !== '') {
        queryOptions.isResolved = request.body.isResolved === '1';
    }
    response.json(parkingDB_getParkingTickets.getParkingTickets(request.session.user, queryOptions));
};
export default handler;
