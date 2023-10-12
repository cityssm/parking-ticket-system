import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js';
import { addParkingBylaw } from '../../database/parkingDB/addParkingBylaw.js';
export const handler = (request, response) => {
    const results = addParkingBylaw(request.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    return response.json(results);
};
export default handler;
