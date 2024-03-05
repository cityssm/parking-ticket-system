import { getParkingLocations } from '../../database/parkingDB/getParkingLocations.js';
export default function handler(_request, response) {
    const locations = getParkingLocations();
    response.render('location-maint', {
        headTitle: 'Parking Location Maintenance',
        locations
    });
}
