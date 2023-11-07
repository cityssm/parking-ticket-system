import { deleteParkingBylaw } from '../../database/parkingDB/deleteParkingBylaw.js';
import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js';
export const handler = (request, response) => {
    const results = deleteParkingBylaw(request.body.bylawNumber);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    return response.json(results);
};
export default handler;
