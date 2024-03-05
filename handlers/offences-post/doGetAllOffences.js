import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js';
export default function handler(_request, response) {
    response.json(getParkingOffences());
}
