import updateParkingLocation from '../../database/parkingDB/updateParkingLocation.js';
import { getParkingLocations } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const results = updateParkingLocation(request.body);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    response.json(results);
}
