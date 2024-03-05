import { addAllParkingTicketsToLookupBatch } from '../../database/parkingDB/addLicencePlateToLookupBatch.js';
export default function handler(request, response) {
    const result = addAllParkingTicketsToLookupBatch(request.body, request.session.user);
    response.json(result);
}
