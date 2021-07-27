import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";
import { updateParkingOffencesByBylawNumber } from "../../helpers/parkingDB/updateParkingOffencesByBylawNumber.js";
export const handler = (request, response) => {
    const results = updateParkingOffencesByBylawNumber(request.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    return response.json(results);
};
export default handler;
