import addParkingLocation from '../../database/parkingDB/addParkingLocation.js';
import getParkingLocations from '../../database/parkingDB/getParkingLocations.js';
export default function handler(request, response) {
    const results = addParkingLocation(request.body);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    response.json(results);
}
