import { getParkingLocations } from '../../helpers/functions.cache.js';
export default function handler(_request, response) {
    const locations = getParkingLocations();
    response.render('location-maint', {
        headTitle: 'Parking Location Maintenance',
        locations
    });
}
