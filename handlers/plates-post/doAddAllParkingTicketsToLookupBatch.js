import { addAllParkingTicketsToLookupBatch } from '../../database/parkingDB/addLicencePlateToLookupBatch.js';
export const handler = (request, response) => {
    const result = addAllParkingTicketsToLookupBatch(request.body, request.session.user);
    return response.json(result);
};
export default handler;
