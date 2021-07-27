import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";
import { updateParkingBylaw } from "../../helpers/parkingDB/updateParkingBylaw.js";
export const handler = (request, response) => {
    const results = updateParkingBylaw(request.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    return response.json(results);
};
export default handler;
