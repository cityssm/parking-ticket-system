import { getParkingLocations } from '../../database/parkingDB/getParkingLocations.js';
import { updateParkingLocation } from '../../database/parkingDB/updateParkingLocation.js';
export default function handler(request, response) {
    const results = updateParkingLocation(request.body);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    response.json(results);
}
