import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js';
import { addParkingOffence } from '../../database/parkingDB/addParkingOffence.js';
export const handler = (request, response) => {
    const results = addParkingOffence(request.body);
    if (results.success && request.body.returnOffences) {
        results.offences = getParkingOffences();
    }
    response.json(results);
};
export default handler;
