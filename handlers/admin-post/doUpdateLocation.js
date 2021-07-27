import { getParkingLocations } from "../../helpers/parkingDB/getParkingLocations.js";
import { updateParkingLocation } from "../../helpers/parkingDB/updateParkingLocation.js";
export const handler = (request, response) => {
    const results = updateParkingLocation(request.body);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    return response.json(results);
};
export default handler;
