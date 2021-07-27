import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";
import { addParkingBylaw } from "../../helpers/parkingDB/addParkingBylaw.js";
export const handler = (request, response) => {
    const results = addParkingBylaw(request.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    return response.json(results);
};
export default handler;
