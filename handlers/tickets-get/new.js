import * as dateTimeFns from '@cityssm/utils-datetime';
import { getRecentParkingTicketVehicleMakeModelValues } from '../../database/parkingDB.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
export const handler = (request, response) => {
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
        issueDateMaxString: dateTimeFns.dateToString(new Date()),
        vehicleMakeModelDatalist
    });
};
export default handler;
