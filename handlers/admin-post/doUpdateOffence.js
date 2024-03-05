import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js';
import { updateParkingOffence } from '../../database/parkingDB/updateParkingOffence.js';
export default function handler(request, response) {
    const results = updateParkingOffence(request.body);
    if (results.success) {
        results.offences = getParkingOffences();
    }
    response.json(results);
}
