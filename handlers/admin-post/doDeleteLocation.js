import deleteParkingLocation from '../../database/parkingDB/deleteParkingLocation.js';
import { getParkingLocations } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const results = deleteParkingLocation(request.body.locationKey);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    response.json(results);
}
