import { getParkingLocations } from "../../helpers/parkingDB/getParkingLocations.js";
import { addParkingLocation } from "../../helpers/parkingDB/addParkingLocation.js";
export const handler = (request, response) => {
    const results = addParkingLocation(request.body);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    return response.json(results);
};
export default handler;
