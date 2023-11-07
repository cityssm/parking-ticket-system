import { deleteParkingOffence } from '../../database/parkingDB/deleteParkingOffence.js';
import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js';
export const handler = (request, response) => {
    const results = deleteParkingOffence(request.body.bylawNumber, request.body.locationKey);
    if (results.success) {
        results.offences = getParkingOffences();
    }
    return response.json(results);
};
export default handler;
