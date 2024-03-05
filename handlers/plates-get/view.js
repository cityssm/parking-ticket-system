import { getAllLicencePlateOwners } from '../../database/parkingDB/getAllLicencePlateOwners.js';
import { getParkingTicketsByLicencePlate } from '../../database/parkingDB/getParkingTickets.js';
export async function handler(request, response) {
    let licencePlateCountry = request.params.licencePlateCountry;
    if (licencePlateCountry === '_') {
        licencePlateCountry = '';
    }
    let licencePlateProvince = request.params.licencePlateProvince;
    if (licencePlateProvince === '_') {
        licencePlateProvince = '';
    }
    let licencePlateNumber = request.params.licencePlateNumber;
    if (licencePlateNumber === '_') {
        licencePlateNumber = '';
    }
    const owners = await getAllLicencePlateOwners(licencePlateCountry, licencePlateProvince, licencePlateNumber);
    const tickets = getParkingTicketsByLicencePlate(licencePlateCountry, licencePlateProvince, licencePlateNumber, request.session.user);
    response.render('plate-view', {
        headTitle: 'Licence Plate ' + licencePlateNumber,
        licencePlateNumber,
        licencePlateProvince,
        licencePlateCountry,
        owners,
        tickets
    });
}
export default handler;
