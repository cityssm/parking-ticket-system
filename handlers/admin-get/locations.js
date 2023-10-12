import { getParkingLocations } from '../../database/parkingDB/getParkingLocations.js';
export const handler = (_request, response) => {
    const locations = getParkingLocations();
    return response.render('location-maint', {
        headTitle: 'Parking Location Maintenance',
        locations
    });
};
export default handler;
