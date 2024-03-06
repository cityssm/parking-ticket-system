import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js';
import updateParkingBylaw from '../../database/parkingDB/updateParkingBylaw.js';
export default function handler(request, response) {
    const results = updateParkingBylaw(request.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    response.json(results);
}
