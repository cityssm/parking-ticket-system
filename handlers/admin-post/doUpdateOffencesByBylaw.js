import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js';
import { updateParkingOffencesByBylawNumber } from '../../database/parkingDB/updateParkingOffencesByBylawNumber.js';
export default function handler(request, response) {
    const results = updateParkingOffencesByBylawNumber(request.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    response.json(results);
}
