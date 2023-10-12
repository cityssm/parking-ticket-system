import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js';
import { updateParkingBylaw } from '../../database/parkingDB/updateParkingBylaw.js';
export const handler = (request, response) => {
    const results = updateParkingBylaw(request.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    return response.json(results);
};
export default handler;
