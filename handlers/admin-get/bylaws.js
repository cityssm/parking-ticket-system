import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js';
export default function handler(_request, response) {
    const bylaws = getParkingBylawsWithOffenceStats();
    response.render('bylaw-maint', {
        headTitle: 'By-Law Maintenance',
        bylaws
    });
}
