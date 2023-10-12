import { getParkingLocations } from '../../database/parkingDB/getParkingLocations.js';
import { addParkingLocation } from '../../database/parkingDB/addParkingLocation.js';
export const handler = (request, response) => {
    const results = addParkingLocation(request.body);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    return response.json(results);
};
export default handler;
