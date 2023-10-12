import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js';
import { updateParkingOffencesByBylawNumber } from '../../database/parkingDB/updateParkingOffencesByBylawNumber.js';
export const handler = (request, response) => {
    const results = updateParkingOffencesByBylawNumber(request.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    return response.json(results);
};
export default handler;
