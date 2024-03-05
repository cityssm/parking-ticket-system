import { getParkingOffencesByLocationKey } from '../../database/parkingDB/getParkingOffences.js';
export default function handler(request, response) {
    response.json(getParkingOffencesByLocationKey(request.body.locationKey));
}
