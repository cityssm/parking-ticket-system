import getParkingTicketsAvailableForMTOLookup from '../../database/parkingDB-ontario/getParkingTicketsAvailableForMTOLookup.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const issueDaysAgo = Number.parseInt(request.body.issueDaysAgo, 10);
    const tickets = getParkingTicketsAvailableForMTOLookup(batchId, issueDaysAgo);
    response.json({
        tickets
    });
}
