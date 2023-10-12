import { getParkingLocations } from '../../database/parkingDB/getParkingLocations.js';
import { getParkingBylaws } from '../../database/parkingDB/getParkingBylaws.js';
import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js';
export const handler = (_request, response) => {
    const locations = getParkingLocations();
    const bylaws = getParkingBylaws();
    const offences = getParkingOffences();
    return response.render('offence-maint', {
        headTitle: 'Parking Offences',
        locations,
        bylaws,
        offences
    });
};
export default handler;
