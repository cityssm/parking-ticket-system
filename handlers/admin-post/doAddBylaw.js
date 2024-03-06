import addParkingBylaw from '../../database/parkingDB/addParkingBylaw.js';
import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js';
export default function handler(request, response) {
    const results = addParkingBylaw(request.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    response.json(results);
}
