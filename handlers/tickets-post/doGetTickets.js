import getParkingTickets from '../../database/parkingDB/getParkingTickets.js';
export default function handler(request, response) {
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
    response.json(getParkingTickets(request.session.user, queryOptions));
}
