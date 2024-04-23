import getParkingOffences from '../../database/parkingDB/getParkingOffences.js';
import { getParkingBylaws, getParkingLocations } from '../../helpers/functions.cache.js';
export default function handler(_request, response) {
    const locations = getParkingLocations();
    const bylaws = getParkingBylaws();
    const offences = getParkingOffences();
    response.render('offence-maint', {
        headTitle: 'Parking Offences',
        locations,
        bylaws,
        offences
    });
}
