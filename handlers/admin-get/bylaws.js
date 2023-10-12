import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js';
export const handler = (_request, response) => {
    const bylaws = getParkingBylawsWithOffenceStats();
    return response.render('bylaw-maint', {
        headTitle: 'By-Law Maintenance',
        bylaws
    });
};
export default handler;
