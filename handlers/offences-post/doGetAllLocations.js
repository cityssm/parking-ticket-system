import getParkingLocations from '../../database/parkingDB/getParkingLocations.js';
export default function handler(_request, response) {
    response.json(getParkingLocations());
}
