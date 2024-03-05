import { dateToString } from '@cityssm/utils-datetime';
import { getRecentParkingTicketVehicleMakeModelValues } from '../../database/parkingDB.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
export default function handler(request, response) {
    const ticketNumber = request.params.ticketNumber;
    const vehicleMakeModelDatalist = getRecentParkingTicketVehicleMakeModelValues();
    response.render('ticket-edit', {
        headTitle: 'New Ticket',
        isCreate: true,
        ticket: {
            ticketNumber,
            licencePlateCountry: getConfigProperty('defaults.country'),
            licencePlateProvince: getConfigProperty('defaults.province')
        },
        issueDateMaxString: dateToString(new Date()),
        vehicleMakeModelDatalist
    });
}
