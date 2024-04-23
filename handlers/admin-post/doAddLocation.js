import addParkingLocation from '../../database/parkingDB/addParkingLocation.js';
import { getParkingLocations } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const results = addParkingLocation(request.body);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    response.json(results);
}
